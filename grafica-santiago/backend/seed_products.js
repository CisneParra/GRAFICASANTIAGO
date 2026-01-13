const mongoose = require('mongoose');
const dotenv = require('dotenv');
const DatabaseConnection = require('./config/database');
const Product = require('./models/product_model');

dotenv.config();

const productosDePrueba = [
    {
        nombre: "Cuaderno Universitario 100 Hojas",
        descripcion: "Cuaderno de cuadros, tapa dura resistente, ideal para estudiantes. Diseños variados.",
        categoria: "Cuadernos",
        precio: { minorista: 2.50, mayorista: 2.10 },
        stock: 150,
        imagenes: [{ url: "https://http2.mlstatic.com/D_NQ_NP_797669-MEC44473634069_012021-O.webp", public_id: "demo1" }]
    },
    {
        nombre: "Resma de Papel Bond A4 (500 hojas)",
        descripcion: "Papel ultra blanco de 75gr, perfecto para impresiones láser e inkjet. Marca Report.",
        categoria: "Papel",
        precio: { minorista: 4.50, mayorista: 3.90 },
        stock: 80,
        imagenes: [{ url: "https://kywi.com.ec/wp-content/uploads/2022/09/RESMA-PAPEL-BOND-A4-75-GR-REPORT.jpg", public_id: "demo2" }]
    },
    {
        nombre: "Caja de Bolígrafos Azul (12 unid)",
        descripcion: "Bolígrafos de punta media, tinta suave y secado rápido. Indispensable para oficina.",
        categoria: "Escritura",
        precio: { minorista: 3.00, mayorista: 2.50 },
        stock: 200,
        imagenes: [{ url: "https://m.media-amazon.com/images/I/61j8VlM+bKL.jpg", public_id: "demo3" }]
    },
    {
        nombre: "Carpeta Archivadora de Palanca",
        descripcion: "Archivador lomo ancho color negro, mecanismo niquelado de alta durabilidad.",
        categoria: "Oficina",
        precio: { minorista: 3.25, mayorista: 2.80 },
        stock: 45,
        imagenes: [{ url: "https://papeleria-tecnica.net/wp-content/uploads/2019/10/Archivador-de-palanca.jpg", public_id: "demo4" }]
    },
    {
        nombre: "Juego Geométrico Profesional",
        descripcion: "Incluye regla de 30cm, escuadras, graduador y compás de precisión.",
        categoria: "Escolares",
        precio: { minorista: 1.75, mayorista: 1.40 },
        stock: 5, // Puesto a propósito bajo para probar la alerta de stock
        imagenes: [{ url: "https://m.media-amazon.com/images/I/71xx+1o+gAL._AC_UF1000,1000_QL80_.jpg", public_id: "demo5" }]
    },
    {
        nombre: "Calculadora Científica Casio",
        descripcion: "240 funciones, pantalla de 2 líneas. Ideal para ingeniería y colegio.",
        categoria: "Tecnología",
        precio: { minorista: 18.50, mayorista: 16.00 },
        stock: 20,
        imagenes: [{ url: "https://m.media-amazon.com/images/I/71s7D+jVwNL.jpg", public_id: "demo6" }]
    }
];

const seedDB = async () => {
    try {
        await DatabaseConnection.getInstance().connect();
        
        console.log("🧹 Limpiando productos antiguos...");
        await Product.deleteMany({}); // Borra todo para no duplicar
        
        console.log("🌱 Insertando productos de prueba...");
        await Product.insertMany(productosDePrueba);
        
        console.log("✅ ¡Éxito! 6 Productos insertados correctamente.");
        process.exit();
    } catch (error) {
        console.error("❌ Error al insertar datos:", error);
        process.exit(1);
    }
};

seedDB();