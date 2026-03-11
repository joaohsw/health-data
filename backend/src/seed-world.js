const supabase = require('./supabaseClient');

const WHO_API_BASE = 'https://ghoapi.azureedge.net/api';

const INDICATORS = [
  {
    code: 'WHOSIS_000001',
    name: 'Life expectancy at birth (years)',
    name_pt: 'Expectativa de vida ao nascer',
    unit: 'anos',
    description: 'Average number of years a newborn is expected to live',
  },
  {
    code: 'MDG_0000000001',
    name: 'Under-five mortality rate (per 1000 live births)',
    name_pt: 'Mortalidade infantil (< 5 anos)',
    unit: 'por 1000 nascidos',
    description: 'Probability of dying between birth and age 5 per 1000 live births',
  },
  {
    code: 'WHS4_100',
    name: 'DTP3 immunization coverage among 1-year-olds (%)',
    name_pt: 'Cobertura vacinal DTP3',
    unit: '%',
    description: 'Percentage of 1-year-olds immunized with DTP3',
  },
  {
    code: 'GHED_CHE_pc_US_SHA2011',
    name: 'Current health expenditure per capita (US$)',
    name_pt: 'Gasto em saude per capita',
    unit: 'US$',
    description: 'Current health expenditure per capita in US dollars',
  },
  {
    code: 'MDG_0000000026',
    name: 'Maternal mortality ratio (per 100 000 live births)',
    name_pt: 'Mortalidade materna',
    unit: 'por 100.000 nascidos',
    description: 'Number of maternal deaths per 100,000 live births',
  },
];

// Major countries to seed (ISO3 codes) - covers all WHO regions
const COUNTRY_LIST = [
  { code: 'AFG', name: 'Afghanistan', name_pt: 'Afeganistao', region: 'Eastern Mediterranean' },
  { code: 'AGO', name: 'Angola', name_pt: 'Angola', region: 'Africa' },
  { code: 'ARG', name: 'Argentina', name_pt: 'Argentina', region: 'Americas' },
  { code: 'AUS', name: 'Australia', name_pt: 'Australia', region: 'Western Pacific' },
  { code: 'BGD', name: 'Bangladesh', name_pt: 'Bangladesh', region: 'South-East Asia' },
  { code: 'BRA', name: 'Brazil', name_pt: 'Brasil', region: 'Americas' },
  { code: 'CAN', name: 'Canada', name_pt: 'Canada', region: 'Americas' },
  { code: 'CHE', name: 'Switzerland', name_pt: 'Suica', region: 'Europe' },
  { code: 'CHN', name: 'China', name_pt: 'China', region: 'Western Pacific' },
  { code: 'CIV', name: "Cote d'Ivoire", name_pt: 'Costa do Marfim', region: 'Africa' },
  { code: 'CMR', name: 'Cameroon', name_pt: 'Camaroes', region: 'Africa' },
  { code: 'COD', name: 'Democratic Republic of the Congo', name_pt: 'Rep. Dem. do Congo', region: 'Africa' },
  { code: 'COL', name: 'Colombia', name_pt: 'Colombia', region: 'Americas' },
  { code: 'CUB', name: 'Cuba', name_pt: 'Cuba', region: 'Americas' },
  { code: 'DEU', name: 'Germany', name_pt: 'Alemanha', region: 'Europe' },
  { code: 'EGY', name: 'Egypt', name_pt: 'Egito', region: 'Eastern Mediterranean' },
  { code: 'ESP', name: 'Spain', name_pt: 'Espanha', region: 'Europe' },
  { code: 'ETH', name: 'Ethiopia', name_pt: 'Etiopia', region: 'Africa' },
  { code: 'FRA', name: 'France', name_pt: 'Franca', region: 'Europe' },
  { code: 'GBR', name: 'United Kingdom', name_pt: 'Reino Unido', region: 'Europe' },
  { code: 'GHA', name: 'Ghana', name_pt: 'Gana', region: 'Africa' },
  { code: 'IDN', name: 'Indonesia', name_pt: 'Indonesia', region: 'South-East Asia' },
  { code: 'IND', name: 'India', name_pt: 'India', region: 'South-East Asia' },
  { code: 'IRN', name: 'Iran', name_pt: 'Ira', region: 'Eastern Mediterranean' },
  { code: 'IRQ', name: 'Iraq', name_pt: 'Iraque', region: 'Eastern Mediterranean' },
  { code: 'ITA', name: 'Italy', name_pt: 'Italia', region: 'Europe' },
  { code: 'JPN', name: 'Japan', name_pt: 'Japao', region: 'Western Pacific' },
  { code: 'KEN', name: 'Kenya', name_pt: 'Quenia', region: 'Africa' },
  { code: 'KOR', name: 'Republic of Korea', name_pt: 'Coreia do Sul', region: 'Western Pacific' },
  { code: 'MEX', name: 'Mexico', name_pt: 'Mexico', region: 'Americas' },
  { code: 'MMR', name: 'Myanmar', name_pt: 'Mianmar', region: 'South-East Asia' },
  { code: 'MOZ', name: 'Mozambique', name_pt: 'Mocambique', region: 'Africa' },
  { code: 'MYS', name: 'Malaysia', name_pt: 'Malasia', region: 'Western Pacific' },
  { code: 'NGA', name: 'Nigeria', name_pt: 'Nigeria', region: 'Africa' },
  { code: 'NOR', name: 'Norway', name_pt: 'Noruega', region: 'Europe' },
  { code: 'PAK', name: 'Pakistan', name_pt: 'Paquistao', region: 'Eastern Mediterranean' },
  { code: 'PER', name: 'Peru', name_pt: 'Peru', region: 'Americas' },
  { code: 'PHL', name: 'Philippines', name_pt: 'Filipinas', region: 'Western Pacific' },
  { code: 'POL', name: 'Poland', name_pt: 'Polonia', region: 'Europe' },
  { code: 'PRT', name: 'Portugal', name_pt: 'Portugal', region: 'Europe' },
  { code: 'RUS', name: 'Russian Federation', name_pt: 'Russia', region: 'Europe' },
  { code: 'SAU', name: 'Saudi Arabia', name_pt: 'Arabia Saudita', region: 'Eastern Mediterranean' },
  { code: 'SDN', name: 'Sudan', name_pt: 'Sudao', region: 'Eastern Mediterranean' },
  { code: 'SWE', name: 'Sweden', name_pt: 'Suecia', region: 'Europe' },
  { code: 'THA', name: 'Thailand', name_pt: 'Tailandia', region: 'South-East Asia' },
  { code: 'TUR', name: 'Turkey', name_pt: 'Turquia', region: 'Europe' },
  { code: 'TZA', name: 'Tanzania', name_pt: 'Tanzania', region: 'Africa' },
  { code: 'UGA', name: 'Uganda', name_pt: 'Uganda', region: 'Africa' },
  { code: 'UKR', name: 'Ukraine', name_pt: 'Ucrania', region: 'Europe' },
  { code: 'USA', name: 'United States of America', name_pt: 'Estados Unidos', region: 'Americas' },
  { code: 'VEN', name: 'Venezuela', name_pt: 'Venezuela', region: 'Americas' },
  { code: 'VNM', name: 'Viet Nam', name_pt: 'Vietna', region: 'Western Pacific' },
  { code: 'ZAF', name: 'South Africa', name_pt: 'Africa do Sul', region: 'Africa' },
  { code: 'ZWE', name: 'Zimbabwe', name_pt: 'Zimbabue', region: 'Africa' },
];

const countryCodes = new Set(COUNTRY_LIST.map(c => c.code));

async function fetchWHOData(indicatorCode) {
  const url = `${WHO_API_BASE}/${indicatorCode}?$filter=TimeDim ge 2010 and TimeDim le 2023`;
  console.log(`  Fetching ${indicatorCode}...`);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  Failed to fetch ${indicatorCode}: ${res.status}`);
      return [];
    }
    const json = await res.json();
    return (json.value || [])
      .filter(d =>
        d.SpatialDim &&
        countryCodes.has(d.SpatialDim) &&
        d.NumericValue !== null &&
        d.NumericValue !== undefined &&
        d.TimeDim
      )
      .map(d => ({
        country_code: d.SpatialDim,
        year: parseInt(d.TimeDim),
        value: parseFloat(d.NumericValue),
      }));
  } catch (err) {
    console.error(`  Error fetching ${indicatorCode}:`, err.message);
    return [];
  }
}

async function seed() {
  console.log('Iniciando seed de dados mundiais...\n');

  // 1. Insert countries
  console.log('Inserindo paises...');
  const { data: insertedCountries, error: countryErr } = await supabase
    .from('countries')
    .upsert(COUNTRY_LIST, { onConflict: 'code' })
    .select();

  if (countryErr) {
    console.error('Erro ao inserir paises:', countryErr.message);
    return;
  }
  console.log(`  ${insertedCountries.length} paises inseridos`);

  // 2. Insert indicators
  console.log('Inserindo indicadores mundiais...');
  const { data: insertedIndicators, error: indErr } = await supabase
    .from('world_indicators')
    .upsert(
      INDICATORS.map(i => ({
        code: i.code,
        name: i.name,
        name_pt: i.name_pt,
        unit: i.unit,
        description: i.description,
      })),
      { onConflict: 'code' }
    )
    .select();

  if (indErr) {
    console.error('Erro ao inserir indicadores:', indErr.message);
    return;
  }
  console.log(`  ${insertedIndicators.length} indicadores inseridos`);

  // 3. Fetch and insert data from WHO API
  console.log('Buscando dados da API WHO GHO...');
  let totalRecords = 0;

  for (const indicator of insertedIndicators) {
    const rawData = await fetchWHOData(indicator.code);

    if (rawData.length === 0) {
      console.log(`  ${indicator.code}: sem dados disponíveis`);
      continue;
    }

    const records = rawData.map(d => ({
      indicator_id: indicator.id,
      country_code: d.country_code,
      year: d.year,
      value: d.value,
      source: 'WHO/GHO',
    }));

    // Insert in batches
    const BATCH_SIZE = 500;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const { error: dataErr } = await supabase.from('world_data').upsert(batch);
      if (dataErr) {
        console.error(`  Erro no batch para ${indicator.code}:`, dataErr.message);
        break;
      }
    }

    totalRecords += records.length;
    console.log(`  ${indicator.code}: ${records.length} registros`);
  }

  console.log(`\nSeed concluido.`);
  console.log(`  ${insertedCountries.length} paises`);
  console.log(`  ${insertedIndicators.length} indicadores`);
  console.log(`  ${totalRecords} registros de dados mundiais`);
}

seed().catch(console.error);
