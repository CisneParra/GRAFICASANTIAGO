const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');

// 👇 CONFIGURACIÓN
const MONGO_URI = 'mongodb://127.0.0.1:27017/grafica_santiago';

console.log("------------------------------------------------");
console.log("🔌 SEED CONECTANDO A:", MONGO_URI);
console.log("------------------------------------------------");

const Product = require('./models/product_model');

const fileBase = path.join(__dirname, 'PRODUCTOS Y PRECIOS(REPORTE DE PRODUCTOS).csv');
const filePrices = path.join(__dirname, 'PRODUCTOS Y PRECIOS(VENTANA CON PRECIOS).csv');

// --- UTILIDADES ---
function normCod(value) {
  const s = String(value ?? '').trim().replace(/\uFEFF/g, '');
  return /^\d+$/.test(s) ? s.padStart(6, '0') : s;
}

function parseDecimalComma(value) {
  if (value == null) return 0;
  const s = String(value).trim();
  if (!s) return 0;
  const clean = s.replace(/[^0-9,.-]/g, '');
  const n = Number(clean.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function parseIntSafe(value) {
  const n = Number(String(value ?? '').trim());
  return Number.isFinite(n) ? n : 0;
}

// 👇 LÓGICA DE CATEGORÍAS (G2 = Cat, G3 = Subcat)
function getCategoryData(r) {
    const g1 = (r.G1 || '').trim();
    const g2 = (r.G2 || '').trim();
    const g3 = (r.G3 || '').trim();

    // 1. Definir Categoría Principal (Prioridad G2, si no G1)
    let cat = 'General';
    if (g2 && g2.length > 1) cat = g2;
    else if (g1 && g1.length > 1) cat = g1;

    // 2. Definir Subcategoría (G3)
    let sub = '';
    if (g3 && g3.length > 1) sub = g3;

    // Formato Capitalizado (Primera mayúscula, resto minúscula)
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

    return {
        categoria: capitalize(cat),
        subcategoria: sub ? capitalize(sub) : ''
    };
}

function readCsv(filePath, separator = ';') {
  return new Promise((resolve, reject) => {
    const rows = [];
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`No existe el archivo: ${filePath}`));
    }
    fs.createReadStream(filePath)
      .pipe(csv({ 
          separator,
          mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '') 
      })) 
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conexión establecida.');

  console.log('🗑️  Limpiando base de datos para recargar estructura nueva...');
  await Product.deleteMany({});

  // 1) PRECIOS
  console.log('📖 Leyendo precios...');
  const priceRows = await readCsv(filePrices, ';');
  const pricesByCod = new Map();

  for (const r of priceRows) {
    const cod = normCod(r.COD);
    pricesByCod.set(cod, {
      stock: parseIntSafe(r.STK),
      pvp: parseDecimalComma(r.PVP),
      mayor: parseDecimalComma(r['PRECIO POR MAYOR'])
    });
  }

  // 2) PRODUCTOS
  console.log('📖 Procesando productos (G2 -> Categoria, G3 -> Subcategoria)...');
  const baseRows = await readCsv(fileBase, ';');
  const ops = [];

  for (const r of baseRows) {
    const cod = normCod(r.COD);
    const p = pricesByCod.get(cod);

    if (!r.NOM) continue;

    const finalStock = p ? p.stock : 0;
    const finalPvp = p ? p.pvp : 0;
    const finalMayor = p ? p.mayor : 0;

    // Usamos la nueva lógica
    const { categoria, subcategoria } = getCategoryData(r);

    const doc = {
      cod,
      nombre: r.NOM.trim(),
      descripcion: (r.DES || '').trim() || r.NOM.trim(),
      precio: {
        minorista: finalPvp,
        mayorista: finalMayor
      },
      stock: finalStock,
      
      // Nuevos campos
      categoria: categoria,
      subcategoria: subcategoria,

      activo: true,
      imagenes: [{ url: "https://via.placeholder.com/300?text=GS" }]
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
    console.log(`🚀 Guardando ${ops.length} productos...`);
    await Product.bulkWrite(ops);
    console.log(`✅ Base de datos actualizada con éxito.`);
  } else {
    console.log('⚠️ No se encontraron productos.');
  }

  await mongoose.disconnect();
  console.log('✅ Desconectado.');
}

run().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});