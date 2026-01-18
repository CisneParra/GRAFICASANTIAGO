const express = require('express');
const router = express.Router();
const Product = require('../models/product_model');

router.get('/categories', async (req, res) => {
  try {
    const cats = await Product.distinct('categoria', { activo: true });
    const categories = cats
      .filter(Boolean)
      .map(c => String(c).trim())
      .filter(c => c.length > 0)
      .sort((a, b) => a.localeCompare(b));

    res.json({ success: true, categories });
  } catch (error) {
    console.error('CATEGORIES ERROR:', error);
    res.status(500).json({ success: false, message: 'Error al obtener categorías' });
  }
});

module.exports = router;
