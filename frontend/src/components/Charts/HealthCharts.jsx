import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#9ca3af', '#6b7280', '#4b5563', '#d1d5db', '#374151', '#f3f4f6', '#e5e7eb', '#111827'];

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1f2937',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '6px',
      padding: '8px 12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: '#6b7280', fontSize: '0.7rem', marginBottom: '2px' }}>{label}</p>
      <p style={{ color: '#f9fafb', fontSize: '0.867rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        {Number(payload[0].value).toLocaleString('pt-BR')} {unit || ''}
      </p>
    </div>
  );
};

export function HealthBarChart({ data, title, subtitle, unit, color = '#9ca3af' }) {
  return (
    <div className="card chart-card animate-in">
      <h3>{title}</h3>
      {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HealthLineChart({ data, title, subtitle, unit, color = '#9ca3af' }) {
  return (
    <div className="card chart-card animate-in">
      <h3>{title}</h3>
      {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#grad-${color.replace('#', '')})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HealthPieChart({ data, title, subtitle }) {
  return (
    <div className="card chart-card animate-in">
      <h3>{title}</h3>
      {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="label"
              strokeWidth={0}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span style={{ color: '#6b7280', fontSize: '0.733rem' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
