import { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable/DataTable';
import { HealthLineChart } from '../components/Charts/HealthCharts';
import { getData, getIndicators, getCategories, getChartData } from '../api/client';

export default function DataExplorer() {
  const [data, setData] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  const [filters, setFilters] = useState({
    category_id: '',
    indicator_id: '',
    state: '',
    year_from: '',
    year_to: '',
    sort_by: 'year',
    sort_order: 'desc',
    page: 1,
    per_page: 25,
  });

  const STATES = [
    'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA',
    'MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN',
    'RO','RR','RS','SC','SE','SP','TO'
  ];

  useEffect(() => {
    Promise.all([getIndicators(), getCategories()])
      .then(([inds, cats]) => { setIndicators(inds); setCategories(cats); });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== '' && val !== undefined) params[key] = val;
      });
      const result = await getData(params);
      setData(result.data || []);
      setPagination(result.pagination || null);

      if (filters.indicator_id) {
        const chart = await getChartData({ indicator_id: filters.indicator_id, group_by: 'year' });
        setChartData(chart);
      } else {
        setChartData(null);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const filteredIndicators = filters.category_id
    ? indicators.filter(ind => ind.category_id === parseInt(filters.category_id))
    : indicators;

  const columns = [
    { key: 'indicator', header: 'Indicador', sortKey: null, accessor: (row) => row.health_indicators?.name || '–' },
    { key: 'category', header: 'Categoria', sortKey: null, accessor: (row) => row.health_indicators?.health_categories?.name || '–' },
    {
      key: 'state', header: 'Estado', sortKey: 'state', accessor: (row) => row.state,
      render: (row) => <span style={{ fontWeight: 500, color: 'var(--text-heading)' }}>{row.state}</span>,
    },
    { key: 'year', header: 'Ano', sortKey: 'year', accessor: (row) => row.year },
    {
      key: 'value', header: 'Valor', sortKey: 'value', accessor: (row) => row.value,
      render: (row) => (
        <span className="value-badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-heading)' }}>
          {Number(row.value).toLocaleString('pt-BR')}
        </span>
      ),
    },
    { key: 'unit', header: 'Unidade', sortKey: null, accessor: (row) => row.health_indicators?.unit || '–' },
    { key: 'source', header: 'Fonte', sortKey: null, accessor: (row) => row.source },
  ];

  return (
    <div>
      <div className="page-header animate-in">
        <h2>Explorador de Dados</h2>
        <p>Consulte e filtre os indicadores de saúde pública</p>
      </div>

      <div className="card animate-in" style={{ padding: '16px 20px', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
          Filtros
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
          <div className="table-filter">
            <select value={filters.category_id} onChange={(e) => { handleFilterChange('category_id', e.target.value); handleFilterChange('indicator_id', ''); }}>
              <option value="">Todas as categorias</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="table-filter">
            <select value={filters.indicator_id} onChange={(e) => handleFilterChange('indicator_id', e.target.value)}>
              <option value="">Todos os indicadores</option>
              {filteredIndicators.map(ind => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
            </select>
          </div>
          <div className="table-filter">
            <select value={filters.state} onChange={(e) => handleFilterChange('state', e.target.value)}>
              <option value="">Todos os estados</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="table-filter">
            <select value={filters.year_from} onChange={(e) => handleFilterChange('year_from', e.target.value)}>
              <option value="">Ano início</option>
              {Array.from({ length: 9 }, (_, i) => 2015 + i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="table-filter">
            <select value={filters.year_to} onChange={(e) => handleFilterChange('year_to', e.target.value)}>
              <option value="">Ano fim</option>
              {Array.from({ length: 9 }, (_, i) => 2015 + i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {chartData && (
        <div style={{ marginBottom: '12px' }}>
          <HealthLineChart
            data={chartData.chart_data}
            title={chartData.indicator}
            subtitle={`Evolução temporal · ${chartData.unit}`}
            unit={chartData.unit}
            color="#9ca3af"
          />
        </div>
      )}

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        onSort={(field, order) => setFilters(prev => ({ ...prev, sort_by: field, sort_order: order, page: 1 }))}
        currentSort={{ field: filters.sort_by, order: filters.sort_order }}
      />
    </div>
  );
}
