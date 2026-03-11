const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/data - Consulta dados com filtros, ordenação e paginação
router.get('/', async (req, res) => {
  try {
    const {
      indicator_id,
      category_id,
      state,
      year_from,
      year_to,
      sort_by = 'year',
      sort_order = 'desc',
      page = 1,
      per_page = 25,
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(per_page);

    let query = supabase
      .from('health_data')
      .select('*, health_indicators!inner(name, unit, category_id, health_categories(name))', { count: 'exact' });

    if (indicator_id) query = query.eq('indicator_id', indicator_id);
    if (state) query = query.ilike('state', `%${state}%`);
    if (year_from) query = query.gte('year', parseInt(year_from));
    if (year_to) query = query.lte('year', parseInt(year_to));
    if (search) query = query.or(`state.ilike.%${search}%,source.ilike.%${search}%`);

    if (category_id) {
      query = query.eq('health_indicators.category_id', category_id);
    }

    const ascending = sort_order === 'asc';
    query = query.order(sort_by, { ascending })
      .range(offset, offset + parseInt(per_page) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      data,
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: count,
        total_pages: Math.ceil(count / parseInt(per_page))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/data/summary - Estatísticas resumidas
router.get('/summary', async (req, res) => {
  try {
    // Total records
    const { count: totalRecords } = await supabase
      .from('health_data')
      .select('*', { count: 'exact', head: true });

    // Total indicators
    const { count: totalIndicators } = await supabase
      .from('health_indicators')
      .select('*', { count: 'exact', head: true });

    // Total categories
    const { count: totalCategories } = await supabase
      .from('health_categories')
      .select('*', { count: 'exact', head: true });

    // Unique states
    const { data: states } = await supabase
      .from('health_data')
      .select('state')
      .limit(1000);

    const uniqueStates = [...new Set(states?.map(s => s.state) || [])];

    // Year range
    const { data: yearData } = await supabase
      .from('health_data')
      .select('year')
      .order('year', { ascending: true })
      .limit(1);

    const { data: yearDataMax } = await supabase
      .from('health_data')
      .select('year')
      .order('year', { ascending: false })
      .limit(1);

    res.json({
      total_records: totalRecords || 0,
      total_indicators: totalIndicators || 0,
      total_categories: totalCategories || 0,
      total_states: uniqueStates.length,
      states: uniqueStates.sort(),
      year_range: {
        min: yearData?.[0]?.year || null,
        max: yearDataMax?.[0]?.year || null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/data/chart - Dados formatados para gráficos
router.get('/chart', async (req, res) => {
  try {
    const { indicator_id, group_by = 'year' } = req.query;

    if (!indicator_id) {
      return res.status(400).json({ error: 'indicator_id is required' });
    }

    let query = supabase
      .from('health_data')
      .select('state, year, value, health_indicators(name, unit)')
      .eq('indicator_id', indicator_id)
      .order('year', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    if (group_by === 'year') {
      const grouped = {};
      data.forEach(row => {
        if (!grouped[row.year]) {
          grouped[row.year] = { year: row.year, total: 0, count: 0 };
        }
        grouped[row.year].total += row.value;
        grouped[row.year].count += 1;
      });

      const chartData = Object.values(grouped).map(g => ({
        label: String(g.year),
        value: Math.round(g.total / g.count * 100) / 100
      }));

      res.json({
        indicator: data[0]?.health_indicators?.name || '',
        unit: data[0]?.health_indicators?.unit || '',
        chart_data: chartData
      });
    } else {
      // Group by state
      const grouped = {};
      data.forEach(row => {
        if (!grouped[row.state]) {
          grouped[row.state] = { state: row.state, total: 0, count: 0 };
        }
        grouped[row.state].total += row.value;
        grouped[row.state].count += 1;
      });

      const chartData = Object.values(grouped)
        .map(g => ({
          label: g.state,
          value: Math.round(g.total / g.count * 100) / 100
        }))
        .sort((a, b) => b.value - a.value);

      res.json({
        indicator: data[0]?.health_indicators?.name || '',
        unit: data[0]?.health_indicators?.unit || '',
        chart_data: chartData
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
