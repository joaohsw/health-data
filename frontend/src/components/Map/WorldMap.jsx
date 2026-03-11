import { useState, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

const WORLD_GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO numeric -> ISO alpha-3 mapping for the countries we track
const NUMERIC_TO_ALPHA3 = {
  '004': 'AFG', '024': 'AGO', '032': 'ARG', '036': 'AUS', '050': 'BGD',
  '076': 'BRA', '120': 'CMR', '124': 'CAN', '156': 'CHN', '170': 'COL',
  '180': 'COD', '384': 'CIV', '192': 'CUB', '818': 'EGY', '231': 'ETH',
  '250': 'FRA', '276': 'DEU', '288': 'GHA', '826': 'GBR', '356': 'IND',
  '360': 'IDN', '364': 'IRN', '368': 'IRQ', '380': 'ITA', '392': 'JPN',
  '404': 'KEN', '410': 'KOR', '458': 'MYS', '484': 'MEX', '104': 'MMR',
  '508': 'MOZ', '566': 'NGA', '578': 'NOR', '586': 'PAK', '604': 'PER',
  '608': 'PHL', '616': 'POL', '620': 'PRT', '643': 'RUS', '682': 'SAU',
  '710': 'ZAF', '724': 'ESP', '736': 'SDN', '752': 'SWE', '756': 'CHE',
  '764': 'THA', '792': 'TUR', '800': 'UGA', '804': 'UKR', '834': 'TZA',
  '840': 'USA', '862': 'VEN', '704': 'VNM', '716': 'ZWE',
};

function WorldMap({ mapData, onCountryClick, onBrazilClick, stats }) {
  const [tooltip, setTooltip] = useState(null);

  const colorScale = scaleLinear()
    .domain([stats?.min || 0, stats?.avg || 50, stats?.max || 100])
    .range(['#374151', '#6b7280', '#e5e7eb']);

  const dataMap = {};
  if (mapData) {
    for (const d of mapData) {
      dataMap[d.country_code] = d.value;
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 120, center: [0, 30] }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <ZoomableGroup translateExtent={[[-200, -100], [1000, 600]]} minZoom={1} maxZoom={5}>
          <Geographies geography={WORLD_GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const numId = geo.id;
                const alpha3 = NUMERIC_TO_ALPHA3[numId];
                const value = alpha3 ? dataMap[alpha3] : undefined;
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
                      if (hasData) {
                        setTooltip({
                          name: geo.properties.name,
                          value: value,
                          code: alpha3,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => {
                      if (alpha3 === 'BRA' && onBrazilClick) {
                        onBrazilClick();
                      } else if (hasData && onCountryClick) {
                        onCountryClick(alpha3, geo.properties.name);
                      }
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
            {tooltip.name}
          </div>
          <div style={{ fontSize: '0.867rem', fontWeight: 700, color: 'var(--text-heading)', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
            {Number(tooltip.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(WorldMap);
