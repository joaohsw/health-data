import { useState, useEffect } from 'react';
import StatCard from '../components/Cards/StatCard';
import { HealthBarChart, HealthLineChart } from '../components/Charts/HealthCharts';
import {
  getDataSummary, getCategories, getIndicators, getChartData,
  getWorldIndicators, getWorldMapData, getWorldCountries,
} from '../api/client';
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
const IconGlobe = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
);

export default function Dashboard() {
  const [tab, setTab] = useState('brasil');
  const [loading, setLoading] = useState(true);

  // Brasil state
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [brChart1, setBrChart1] = useState(null);
  const [brChart2, setBrChart2] = useState(null);
  const [brChart3, setBrChart3] = useState(null);

  // World state
  const [worldIndicators, setWorldIndicators] = useState([]);
  const [worldCountryCount, setWorldCountryCount] = useState(0);
  const [worldCharts, setWorldCharts] = useState([]);
  const [worldLoading, setWorldLoading] = useState(false);
  const [worldLoaded, setWorldLoaded] = useState(false);

  // Load Brasil data
  useEffect(() => {
    async function loadBrasil() {
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
          setBrChart1(charts[0]);
          setBrChart2(charts[1]);
          setBrChart3(charts[2]);
        }
      } catch (err) {
        console.error('Error loading Brasil data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBrasil();
  }, []);

  // Load World data on first tab switch
  useEffect(() => {
    if (tab !== 'world' || worldLoaded) return;
    setWorldLoading(true);

    async function loadWorld() {
      try {
        const [inds, countries] = await Promise.all([
          getWorldIndicators(),
          getWorldCountries(),
        ]);
        setWorldIndicators(inds);
        setWorldCountryCount(countries.length);

        // Get map data for each indicator (latest year)
        const charts = [];
        for (const ind of inds.slice(0, 5)) {
          try {
            const res = await getWorldMapData({ indicator_id: ind.id });
            if (res.data && res.data.length > 0) {
              // Sort and take top/bottom for bar chart
              const sorted = [...res.data].sort((a, b) => b.value - a.value);
              charts.push({
                indicator: ind.name_pt || ind.name,
                unit: ind.unit,
                data: sorted.slice(0, 10).map(d => ({ label: d.country_code, value: d.value })),
                stats: res.stats,
              });
            }
          } catch (e) {
            // skip
          }
        }
        setWorldCharts(charts);
        setWorldLoaded(true);
      } catch (err) {
        console.error('Error loading world data:', err);
      } finally {
        setWorldLoading(false);
      }
    }
    loadWorld();
  }, [tab, worldLoaded]);

  if (loading) {
    return (
      <div>
        <div className="page-header animate-in">
          <h2>Dashboard</h2>
          <p>Carregando dados...</p>
        </div>
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
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
        <p>Visao geral dos indicadores de saude publica</p>
      </div>

      {/* Tab switcher */}
      <div className="card animate-in" style={{ padding: '4px', marginBottom: '20px', display: 'inline-flex', gap: '2px' }}>
        <button
          onClick={() => setTab('brasil')}
          style={{
            padding: '7px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: tab === 'brasil' ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: tab === 'brasil' ? 'var(--text-heading)' : 'var(--text-muted)',
            fontSize: '0.8rem',
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          Brasil
        </button>
        <button
          onClick={() => setTab('world')}
          style={{
            padding: '7px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: tab === 'world' ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: tab === 'world' ? 'var(--text-heading)' : 'var(--text-muted)',
            fontSize: '0.8rem',
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          Mundo
        </button>
      </div>

      {/* ============ BRASIL TAB ============ */}
      {tab === 'brasil' && (
        <div className="animate-in">
          <div className="stats-grid">
            <StatCard
              icon={<IconDatabase />}
              label="Registros"
              value={summary?.total_records?.toLocaleString('pt-BR') || '0'}
              description="Dados coletados"
              delay={1}
            />
            <StatCard
              icon={<IconChart />}
              label="Indicadores"
              value={summary?.total_indicators || '0'}
              description="Metricas monitoradas"
              delay={2}
            />
            <StatCard
              icon={<IconFolder />}
              label="Categorias"
              value={summary?.total_categories || '0'}
              description="Areas de saude"
              delay={3}
            />
            <StatCard
              icon={<IconMap />}
              label="Estados"
              value={summary?.total_states || '0'}
              description="UFs cobertas"
              delay={4}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '12px' }}>
            {brChart1 && (
              <HealthLineChart
                data={brChart1.chart_data}
                title={brChart1.indicator}
                subtitle={`Evolucao temporal \u00b7 ${brChart1.unit}`}
                unit={brChart1.unit}
                color="#9ca3af"
              />
            )}
            {brChart2 && (
              <HealthBarChart
                data={brChart2.chart_data}
                title={brChart2.indicator}
                subtitle={`Por ano \u00b7 ${brChart2.unit}`}
                unit={brChart2.unit}
                color="#6b7280"
              />
            )}
          </div>

          {brChart3 && (
            <HealthBarChart
              data={brChart3.chart_data.slice(0, 15)}
              title={brChart3.indicator}
              subtitle={`Top 15 estados \u00b7 ${brChart3.unit}`}
              unit={brChart3.unit}
              color="#4b5563"
            />
          )}

          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '0.933rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-heading)' }}>
              Categorias DATASUS
            </h3>
            <div className="categories-grid">
              {categories.map((cat) => {
                const catIndicators = indicators.filter(ind => ind.category_id === cat.id);
                return (
                  <Link key={cat.id} to={`/category/${cat.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card category-card">
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
      )}

      {/* ============ WORLD TAB ============ */}
      {tab === 'world' && (
        <div className="animate-in">
          {worldLoading ? (
            <div>
              <div className="stats-grid">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card skeleton skeleton-card" />
                ))}
              </div>
              <div className="card skeleton" style={{ height: '300px', marginTop: '12px' }} />
            </div>
          ) : (
            <>
              <div className="stats-grid">
                <StatCard
                  icon={<IconGlobe />}
                  label="Paises"
                  value={worldCountryCount || '0'}
                  description="Paises monitorados"
                  delay={1}
                />
                <StatCard
                  icon={<IconChart />}
                  label="Indicadores"
                  value={worldIndicators.length || '0'}
                  description="Metricas da OMS"
                  delay={2}
                />
                <StatCard
                  icon={<IconDatabase />}
                  label="Fonte"
                  value="WHO"
                  description="Global Health Observatory"
                  delay={3}
                />
              </div>

              {/* World indicator charts - top 10 countries per indicator */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '12px' }}>
                {worldCharts.map((chart, i) => (
                  <HealthBarChart
                    key={i}
                    data={chart.data}
                    title={chart.indicator}
                    subtitle={`Top 10 paises \u00b7 ${chart.unit}`}
                    unit={chart.unit}
                    color={['#9ca3af', '#6b7280', '#4b5563', '#d1d5db', '#374151'][i % 5]}
                  />
                ))}
              </div>

              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '0.933rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-heading)' }}>
                  Indicadores Mundiais (OMS)
                </h3>
                <div className="categories-grid">
                  {worldIndicators.map((ind) => (
                    <Link key={ind.id} to="/map" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="card category-card">
                        <h3>{ind.name_pt || ind.name}</h3>
                        <p>{ind.description}</p>
                        <div className="indicator-count">
                          {ind.unit}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
