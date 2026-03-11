const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/world/countries
router.get('/countries', async (req, res) => {
  try {
    const { region } = req.query;
    let query = supabase.from('countries').select('*').order('name');
    if (region) query = query.eq('region', region);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/world/indicators
router.get('/indicators', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('world_indicators')
      .select('*')
      .order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/world/data
router.get('/data', async (req, res) => {
  try {
    const { country_code, indicator_id, year_from, year_to, page = 1, per_page = 50, sort_by = 'year', sort_order = 'desc' } = req.query;

    let query = supabase
      .from('world_data')
      .select(`
        *,
        world_indicators(name, name_pt, unit, code),
        countries:country_code(name, name_pt, region)
      `, { count: 'exact' });

    if (country_code) query = query.eq('country_code', country_code);
    if (indicator_id) query = query.eq('indicator_id', parseInt(indicator_id));
    if (year_from) query = query.gte('year', parseInt(year_from));
    if (year_to) query = query.lte('year', parseInt(year_to));

    const ascending = sort_order === 'asc';
    query = query.order(sort_by, { ascending });

    const offset = (parseInt(page) - 1) * parseInt(per_page);
    query = query.range(offset, offset + parseInt(per_page) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      data,
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: count,
        total_pages: Math.ceil(count / parseInt(per_page)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/world/map-data - data formatted for choropleth map
router.get('/map-data', async (req, res) => {
  try {
    const { indicator_id, year } = req.query;
    if (!indicator_id) return res.status(400).json({ error: 'indicator_id is required' });

    let query = supabase
      .from('world_data')
      .select('country_code, year, value')
      .eq('indicator_id', parseInt(indicator_id));

    if (year) {
      query = query.eq('year', parseInt(year));
    } else {
      // Get latest year for each country
      query = query.order('year', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    // If no year specified, get the latest value per country
    const countryMap = {};
    for (const row of data) {
      if (!countryMap[row.country_code]) {
        countryMap[row.country_code] = row;
      }
    }

    const mapData = year ? data : Object.values(countryMap);
    const values = mapData.map(d => d.value);

    res.json({
      data: mapData,
      stats: {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/world/country/:code - data for a single country
router.get('/country/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const [countryRes, dataRes] = await Promise.all([
      supabase.from('countries').select('*').eq('code', code).single(),
      supabase
        .from('world_data')
        .select('*, world_indicators(name, name_pt, unit)')
        .eq('country_code', code)
        .order('year', { ascending: true }),
    ]);

    if (countryRes.error) throw countryRes.error;
    if (dataRes.error) throw dataRes.error;

    // Group data by indicator
    const byIndicator = {};
    for (const row of dataRes.data) {
      const indName = row.world_indicators?.name_pt || row.world_indicators?.name;
      if (!byIndicator[indName]) {
        byIndicator[indName] = {
          indicator: indName,
          unit: row.world_indicators?.unit,
          data: [],
        };
      }
      byIndicator[indName].data.push({
        year: row.year,
        value: row.value,
      });
    }

    res.json({
      country: countryRes.data,
      indicators: Object.values(byIndicator),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
