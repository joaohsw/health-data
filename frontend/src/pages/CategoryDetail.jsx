import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import DataTable from '../components/DataTable/DataTable';
import { HealthBarChart, HealthLineChart } from '../components/Charts/HealthCharts';
import { getCategory, getData, getChartData } from '../api/client';

export default function CategoryDetail() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndicator, setSelectedIndicator] = useState('');
  const [chartData, setChartData] = useState(null);
  const [chartByState, setChartByState] = useState(null);
  const [sort, setSort] = useState({ field: 'year', order: 'desc' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setSelectedIndicator('');
    setChartData(null);
    setChartByState(null);
    setPage(1);
    getCategory(id).then(setCategory).catch(console.error);
  }, [id]);

  const loadData = useCallback(async () => {
    if (!category) return;
    setLoading(true);
    try {
      const params = { category_id: id, sort_by: sort.field, sort_order: sort.order, page, per_page: 25 };
      if (selectedIndicator) params.indicator_id = selectedIndicator;
      const result = await getData(params);
      setData(result.data || []);
      setPagination(result.pagination || null);
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }, [id, category, selectedIndicator, sort, page]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!selectedIndicator) { setChartData(null); setChartByState(null); return; }
    Promise.all([
      getChartData({ indicator_id: selectedIndicator, group_by: 'year' }),
      getChartData({ indicator_id: selectedIndicator, group_by: 'state' }),
    ]).then(([byYear, byState]) => { setChartData(byYear); setChartByState(byState); }).catch(console.error);
  }, [selectedIndicator]);

  const columns = [
    { key: 'indicator', header: 'Indicador', sortKey: null, accessor: (row) => row.health_indicators?.name || '–' },
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

  if (!category) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <span className="loading-text">Carregando categoria...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header animate-in">
        <Link to="/categories" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
          ← Categorias
        </Link>
        <h2>{category.name}</h2>
        <p>{category.description}</p>
        <div className="badge">{category.indicators?.length || 0} indicadores</div>
      </div>

      {category.indicators?.length > 0 && (
        <div className="card animate-in" style={{ padding: '16px 20px', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            Indicador
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[{ id: '', name: 'Todos' }, ...category.indicators].map(ind => (
              <button
                key={ind.id}
                onClick={() => setSelectedIndicator(String(ind.id))}
                style={{
                  padding: '5px 12px',
                  borderRadius: '99px',
                  border: `1px solid ${selectedIndicator === String(ind.id) ? 'var(--border-emphasis)' : 'var(--border-default)'}`,
                  background: selectedIndicator === String(ind.id) ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: selectedIndicator === String(ind.id) ? 'var(--text-heading)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.733rem',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  transition: 'all 150ms ease',
                }}
              >
                {ind.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {chartData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <HealthLineChart
            data={chartData.chart_data}
            title={chartData.indicator}
            subtitle={`Evolução temporal · ${chartData.unit}`}
            unit={chartData.unit}
            color="#9ca3af"
          />
          {chartByState && (
            <HealthBarChart
              data={chartByState.chart_data.slice(0, 15)}
              title={`${chartByState.indicator} por Estado`}
              subtitle={`Top 15 · ${chartByState.unit}`}
              unit={chartByState.unit}
              color="#6b7280"
            />
          )}
        </div>
      )}

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        onSort={(field, order) => { setSort({ field, order }); setPage(1); }}
        currentSort={sort}
      />
    </div>
  );
}
