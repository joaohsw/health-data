import { useState, useEffect, useCallback } from 'react';
import WorldMap from '../components/Map/WorldMap';
import BrazilMap from '../components/Map/BrazilMap';
import { HealthLineChart } from '../components/Charts/HealthCharts';
import {
  getWorldIndicators,
  getWorldMapData,
  getWorldCountryDetail,
  getChartData,
  getIndicators,
} from '../api/client';

export default function MapPage() {
  const [view, setView] = useState('world'); // 'world' | 'brazil'
  const [indicators, setIndicators] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [mapData, setMapData] = useState(null);
  const [mapStats, setMapStats] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryDetail, setCountryDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Brazil-specific state
  const [brIndicators, setBrIndicators] = useState([]);
  const [brSelectedIndicator, setBrSelectedIndicator] = useState('');
  const [brData, setBrData] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [stateChartData, setStateChartData] = useState(null);

  const years = Array.from({ length: 14 }, (_, i) => 2010 + i);

  // Load world indicators
  useEffect(() => {
    getWorldIndicators()
      .then((data) => {
        setIndicators(data);
        if (data.length > 0) setSelectedIndicator(String(data[0].id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Load DATASUS indicators when entering Brazil view
  useEffect(() => {
    if (view === 'brazil') {
      getIndicators()
        .then((data) => {
          setBrIndicators(data);
          if (data.length > 0) setBrSelectedIndicator(String(data[0].id));
        })
        .catch(console.error);
    }
  }, [view]);

  // Load world map data when indicator/year changes
  const loadMapData = useCallback(async () => {
    if (!selectedIndicator || view !== 'world') return;
    try {
      const params = { indicator_id: selectedIndicator };
      if (selectedYear) params.year = selectedYear;
      const result = await getWorldMapData(params);
      setMapData(result.data);
      setMapStats(result.stats);
    } catch (err) {
      console.error('Error loading map data:', err);
    }
  }, [selectedIndicator, selectedYear, view]);

  useEffect(() => { loadMapData(); }, [loadMapData]);

  // Load Brazil UF data
  useEffect(() => {
    if (view !== 'brazil' || !brSelectedIndicator) return;

    const fetchBrData = async () => {
      try {
        const result = await getChartData({
          indicator_id: brSelectedIndicator,
          group_by: 'state',
        });
        const mapped = (result.chart_data || []).map(d => ({
          state: d.label,
          value: d.value,
        }));
        setBrData(mapped);
      } catch (err) {
        console.error('Error loading Brazil data:', err);
      }
    };
    fetchBrData();
  }, [view, brSelectedIndicator]);

  // Load country detail
  const handleCountryClick = async (code, name) => {
    setSelectedCountry({ code, name });
    try {
      const detail = await getWorldCountryDetail(code);
      setCountryDetail(detail);
    } catch (err) {
      console.error('Error loading country detail:', err);
    }
  };

  // Load state chart data
  const handleStateClick = async (uf, name) => {
    setSelectedState({ uf, name });
    if (!brSelectedIndicator) return;
    try {
      const chart = await getChartData({ indicator_id: brSelectedIndicator, group_by: 'year' });
      setStateChartData(chart);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBrazilClick = () => {
    setView('brazil');
    setSelectedCountry(null);
    setCountryDetail(null);
  };

  const handleBackToWorld = () => {
    setView('world');
    setSelectedState(null);
    setStateChartData(null);
  };

  const currentIndicator = indicators.find(i => String(i.id) === selectedIndicator);

  if (loading) {
    return (
      <div>
        <div className="page-header animate-in">
          <h2>Mapa</h2>
          <p>Carregando...</p>
        </div>
        <div className="card skeleton" style={{ height: '500px' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header animate-in">
        <h2>{view === 'world' ? 'Mapa Mundial' : 'Brasil por UF'}</h2>
        <p>
          {view === 'world'
            ? 'Dados de saude da OMS - clique em um pais para detalhes, clique no Brasil para ver dados por UF'
            : 'Dados DATASUS por unidade federativa'}
        </p>
      </div>

      {/* Controls */}
      <div className="card animate-in" style={{ padding: '16px 20px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {view === 'world' ? (
            <>
              <div className="table-filter">
                <select
                  value={selectedIndicator}
                  onChange={(e) => setSelectedIndicator(e.target.value)}
                >
                  {indicators.map(ind => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name_pt || ind.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="table-filter">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">Ultimo dado disponivel</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          ) : (
            <div className="table-filter">
              <select
                value={brSelectedIndicator}
                onChange={(e) => setBrSelectedIndicator(e.target.value)}
              >
                {brIndicators.map(ind => (
                  <option key={ind.id} value={ind.id}>{ind.name}</option>
                ))}
              </select>
            </div>
          )}

          {currentIndicator && view === 'world' && (
            <span style={{ fontSize: '0.733rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              Unidade: {currentIndicator.unit}
            </span>
          )}
        </div>
      </div>

      {/* Map + Detail Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedCountry || selectedState ? '1fr 360px' : '1fr', gap: '12px' }}>
        <div className="card animate-in" style={{ padding: '12px', minHeight: '500px', overflow: 'hidden' }}>
          {view === 'world' ? (
            <WorldMap
              mapData={mapData}
              stats={mapStats}
              onCountryClick={handleCountryClick}
              onBrazilClick={handleBrazilClick}
            />
          ) : (
            <BrazilMap
              data={brData}
              onStateClick={handleStateClick}
              onBack={handleBackToWorld}
            />
          )}
        </div>

        {/* Country detail panel */}
        {selectedCountry && countryDetail && (
          <div className="card animate-in" style={{ padding: '20px', overflow: 'auto', maxHeight: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                  {countryDetail.country?.name_pt || countryDetail.country?.name}
                </h3>
                <span style={{ fontSize: '0.733rem', color: 'var(--text-muted)' }}>
                  {countryDetail.country?.region} / {countryDetail.country?.code}
                </span>
              </div>
              <button
                onClick={() => { setSelectedCountry(null); setCountryDetail(null); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                x
              </button>
            </div>

            {countryDetail.indicators?.map((ind, i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>
                  {ind.indicator}
                </h4>
                <span style={{ fontSize: '0.667rem', color: 'var(--text-muted)' }}>{ind.unit}</span>
                {ind.data.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-heading)', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(ind.data[ind.data.length - 1].value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
                    </div>
                    <span style={{ fontSize: '0.667rem', color: 'var(--text-muted)' }}>
                      ({ind.data[ind.data.length - 1].year})
                    </span>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '3px', alignItems: 'flex-end', height: '40px' }}>
                      {ind.data.slice(-10).map((d, j) => {
                        const max = Math.max(...ind.data.slice(-10).map(x => x.value));
                        const height = max > 0 ? (d.value / max) * 36 : 4;
                        return (
                          <div
                            key={j}
                            style={{
                              flex: 1,
                              height: `${height}px`,
                              background: '#6b7280',
                              borderRadius: '2px 2px 0 0',
                            }}
                            title={`${d.year}: ${Number(d.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* UF detail panel */}
        {selectedState && stateChartData && view === 'brazil' && (
          <div className="card animate-in" style={{ padding: '20px', overflow: 'auto', maxHeight: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                  {selectedState.name}
                </h3>
                <span style={{ fontSize: '0.733rem', color: 'var(--text-muted)' }}>
                  {selectedState.uf}
                </span>
              </div>
              <button
                onClick={() => { setSelectedState(null); setStateChartData(null); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                x
              </button>
            </div>

            <HealthLineChart
              data={stateChartData.chart_data}
              title={stateChartData.indicator}
              subtitle={stateChartData.unit}
              unit={stateChartData.unit}
              color="#9ca3af"
            />
          </div>
        )}
      </div>

      {/* Legend */}
      {mapStats && view === 'world' && (
        <div className="card" style={{ padding: '12px 20px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.733rem', color: 'var(--text-muted)' }}>
            {Number(mapStats.min).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </span>
          <div style={{
            flex: 1,
            height: '8px',
            borderRadius: '4px',
            background: 'linear-gradient(to right, #374151, #6b7280, #e5e7eb)',
          }} />
          <span style={{ fontSize: '0.733rem', color: 'var(--text-muted)' }}>
            {Number(mapStats.max).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </span>
          <span style={{ fontSize: '0.667rem', color: 'var(--text-muted)', borderLeft: '1px solid var(--border-default)', paddingLeft: '8px' }}>
            {currentIndicator?.unit || ''}
          </span>
        </div>
      )}
    </div>
  );
}
