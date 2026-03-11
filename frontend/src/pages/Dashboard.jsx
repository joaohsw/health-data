import { useState, useEffect } from 'react';
import StatCard from '../components/Cards/StatCard';
import { HealthBarChart, HealthLineChart } from '../components/Charts/HealthCharts';
import { getDataSummary, getCategories, getIndicators, getChartData } from '../api/client';
import { Link } from 'react-router-dom';

const IconDatabase = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
);
const IconChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
);
const IconFolder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
);
const IconMap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 7 6-3 6 3 6-3v13l-6 3-6-3-6 3Z"/><path d="M9 4v13"/><path d="M15 7v13"/></svg>
);
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
);

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [chartData1, setChartData1] = useState(null);
  const [chartData2, setChartData2] = useState(null);
  const [chartData3, setChartData3] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [summaryRes, categoriesRes, indicatorsRes] = await Promise.all([
          getDataSummary(),
          getCategories(),
          getIndicators(),
        ]);
        setSummary(summaryRes);
        setCategories(categoriesRes);
        setIndicators(indicatorsRes);

        if (indicatorsRes.length > 0) {
          const charts = await Promise.all([
            getChartData({ indicator_id: indicatorsRes[0].id, group_by: 'year' }),
            indicatorsRes.length > 5 ? getChartData({ indicator_id: indicatorsRes[5].id, group_by: 'year' }) : null,
            indicatorsRes.length > 10 ? getChartData({ indicator_id: indicatorsRes[10].id, group_by: 'state' }) : null,
          ]);
          setChartData1(charts[0]);
          setChartData2(charts[1]);
          setChartData3(charts[2]);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header animate-in">
          <h2>Dashboard</h2>
          <p>Carregando dados...</p>
        </div>
        <div className="stats-grid">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card skeleton skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header animate-in">
        <h2>Dashboard</h2>
        <p>Visão geral dos indicadores de saúde pública do DATASUS</p>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<IconDatabase />}
          label="Registros"
          value={summary?.total_records?.toLocaleString('pt-BR') || '0'}
          description="Dados coletados"
          color="blue"
          delay={1}
        />
        <StatCard
          icon={<IconChart />}
          label="Indicadores"
          value={summary?.total_indicators || '0'}
          description="Métricas monitoradas"
          color="purple"
          delay={2}
        />
        <StatCard
          icon={<IconFolder />}
          label="Categorias"
          value={summary?.total_categories || '0'}
          description="Áreas de saúde"
          color="green"
          delay={3}
        />
        <StatCard
          icon={<IconMap />}
          label="Estados"
          value={summary?.total_states || '0'}
          description="UFs cobertas"
          color="amber"
          delay={4}
        />
        <StatCard
          icon={<IconCalendar />}
          label="Período"
          value={summary?.year_range ? `${summary.year_range.min}–${summary.year_range.max}` : '–'}
          description="Intervalo temporal"
          color="gray"
          delay={4}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '12px' }}>
        {chartData1 && (
          <HealthLineChart
            data={chartData1.chart_data}
            title={chartData1.indicator}
            subtitle={`Evolucao temporal · ${chartData1.unit}`}
            unit={chartData1.unit}
            color="#9ca3af"
          />
        )}
        {chartData2 && (
          <HealthBarChart
            data={chartData2.chart_data}
            title={chartData2.indicator}
            subtitle={`Por ano · ${chartData2.unit}`}
            unit={chartData2.unit}
            color="#6b7280"
          />
        )}
      </div>

      {chartData3 && (
        <HealthBarChart
          data={chartData3.chart_data.slice(0, 15)}
          title={chartData3.indicator}
          subtitle={`Top 15 estados · ${chartData3.unit}`}
          unit={chartData3.unit}
          color="#4b5563"
        />
      )}

      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '0.933rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-heading)' }}>
          Categorias
        </h3>
        <div className="categories-grid">
          {categories.map((cat) => {
            const catIndicators = indicators.filter(ind => ind.category_id === cat.id);
            return (
              <Link key={cat.id} to={`/category/${cat.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card category-card">
                  <div className="category-card-icon">{cat.name.charAt(0)}</div>
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                  <div className="indicator-count">
                    {catIndicators.length} indicadores
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
