const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/categories - Lista todas as categorias
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('health_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories/:id - Categoria com seus indicadores
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: category, error: catError } = await supabase
      .from('health_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (catError) throw catError;

    const { data: indicators, error: indError } = await supabase
      .from('health_indicators')
      .select('*')
      .eq('category_id', id)
      .order('name');

    if (indError) throw indError;

    res.json({ ...category, indicators });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
