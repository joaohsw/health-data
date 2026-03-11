const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/indicators - Lista indicadores (com filtro opcional por categoria)
router.get('/', async (req, res) => {
  try {
    const { category_id } = req.query;

    let query = supabase
      .from('health_indicators')
      .select('*, health_categories(name)')
      .order('name');

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/indicators/:id - Detalhes de um indicador
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('health_indicators')
      .select('*, health_categories(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
