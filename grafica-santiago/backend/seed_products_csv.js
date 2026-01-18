const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/product_model');

const MONGO_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/grafica_santiago';

const fileBase = path.join(__dirname, 'PRODUCTOS Y PRECIOS(REPORTE DE PRODUCTOS).csv');
const filePrices = path.join(__dirname, 'PRODUCTOS Y PRECIOS(VENTANA CON PRECIOS).csv');

function normCod(value) {
  const s = String(value ?? '').trim().replace(/\uFEFF/g, '');
  return /^\d+$/.test(s) ? s.padStart(6, '0') : s;
}

function parseDecimalComma(value) {
  if (value === null || value === undefined) return 0;
  const s = String(value).trim();
  if (!s) return 0;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function parseIntSafe(value) {
  const n = Number(String(value ?? '').trim());
  return Number.isFinite(n) ? n : 0;
}

function readCsv(filePath, separator = ';') {
  return new Promise((resolve, reject) => {
    const rows = [];
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`No existe el archivo: ${filePath}`));
    }

    fs.createReadStream(filePath)
      .pipe(csv({ separator }))
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

function pickCategory(r) {
  // según tus CSV: G1/G2/G3
  const g3 = (r.G3 || '').trim();
  const g2 = (r.G2 || '').trim();
  const g1 = (r.G1 || '').trim();
  return g3 || g2 || g1 || 'General';
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conectado a Mongo:', MONGO_URI);

  // 1) Cargar precios por COD
  const priceRows = await readCsv(filePrices, ';');
  const pricesByCod = new Map();

  for (const r of priceRows) {
    const cod = normCod(r.COD);
    pricesByCod.set(cod, {
      stock: parseIntSafe(r.STK),
      pvp: parseDecimalComma(r.PVP), // minorista
      mayor: parseDecimalComma(r['PRECIO POR MAYOR'])
    });
  }

  // 2) Cargar base y merge
  const baseRows = await readCsv(fileBase, ';');
  const ops = [];

  for (const r of baseRows) {
    const cod = normCod(r.COD);
    const p = pricesByCod.get(cod) || { stock: 0, pvp: 0, mayor: 0 };

    const doc = {
      cod,
      nombre: (r.NOM || '').trim() || `Producto ${cod}`,
      descripcion: '',

      precio: {
        minorista: p.pvp,
        mayorista: p.mayor
      },

      stock: p.stock,
      categoria: pickCategory(r),
      activo: true
    };

    ops.push({
      updateOne: {
        filter: { cod },
        update: { $set: doc },
        upsert: true
      }
    });
  }

  if (ops.length) {
    const result = await Product.bulkWrite(ops);
    console.log('✅ Seed terminado. Operaciones:', ops.length);
    console.log('   upserts:', result.upsertedCount, 'modified:', result.modifiedCount);
  } else {
    console.log('⚠️ No se encontraron filas en CSV.');
  }

  await mongoose.disconnect();
  console.log('✅ Desconectado.');
}

run().catch((e) => {
  console.error('❌ Error seed:', e);
  process.exit(1);
});
