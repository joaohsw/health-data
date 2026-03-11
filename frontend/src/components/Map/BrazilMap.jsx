import { useState, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

const BRAZIL_GEO_URL = 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

// Maps GeoJSON state names to DATASUS UF abbreviations
const STATE_TO_UF = {
  'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
  'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
  'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
  'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS', 'Rondônia': 'RO',
  'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE',
  'Tocantins': 'TO',
};

function BrazilMap({ data, onStateClick, onBack }) {
  const [tooltip, setTooltip] = useState(null);

  // Build value map from UF abbreviation -> value
  const valueMap = {};
  if (data) {
    for (const d of data) {
      valueMap[d.state] = d.value;
    }
  }

  const values = Object.values(valueMap);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 100;
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 50;

  const colorScale = scaleLinear()
    .domain([min, avg, max])
    .range(['#374151', '#6b7280', '#e5e7eb']);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 10,
          padding: '5px 12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-body)',
          fontSize: '0.733rem',
          fontFamily: 'Inter, sans-serif',
          cursor: 'pointer',
        }}
      >
        Voltar ao mapa mundi
      </button>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 600, center: [-52, -15] }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <ZoomableGroup translateExtent={[[-100, -100], [900, 700]]} minZoom={1} maxZoom={5}>
          <Geographies geography={BRAZIL_GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.name;
                const uf = STATE_TO_UF[stateName];
                const value = uf ? valueMap[uf] : undefined;
                const hasData = value !== undefined;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={hasData ? colorScale(value) : '#1f2937'}
                    stroke="#111827"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: hasData ? '#d1d5db' : '#374151', cursor: hasData ? 'pointer' : 'default' },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={() => {
                      if (uf) {
                        setTooltip({ name: stateName, uf, value });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => {
                      if (uf && onStateClick) onStateClick(uf, stateName);
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-heading)' }}>
            {tooltip.name} ({tooltip.uf})
          </div>
          {tooltip.value !== undefined && (
            <div style={{ fontSize: '0.867rem', fontWeight: 700, color: 'var(--text-heading)', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
              {Number(tooltip.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(BrazilMap);
