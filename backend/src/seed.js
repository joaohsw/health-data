const supabase = require('./supabaseClient');

const CATEGORIES = [
  { name: 'Mortalidade', description: 'Dados de mortalidade por diferentes causas - SIM/DATASUS', icon: null },
  { name: 'Vacinação', description: 'Cobertura vacinal e doses aplicadas - PNI/DATASUS', icon: null },
  { name: 'Morbidade Hospitalar', description: 'Internações hospitalares por grupo de causas - SIH/DATASUS', icon: null },
  { name: 'Nascidos Vivos', description: 'Dados do Sistema de Informações sobre Nascidos Vivos - SINASC/DATASUS', icon: null },
  { name: 'Doenças e Agravos', description: 'Notificações de doenças e agravos - SINAN/DATASUS', icon: null },
];

const INDICATORS = [
  // Mortalidade
  { category_index: 0, name: 'Taxa de Mortalidade Infantil', unit: 'por 1.000 nascidos vivos', description: 'Óbitos de menores de 1 ano por mil nascidos vivos' },
  { category_index: 0, name: 'Taxa de Mortalidade Neonatal', unit: 'por 1.000 nascidos vivos', description: 'Óbitos de 0 a 27 dias por mil nascidos vivos' },
  { category_index: 0, name: 'Mortalidade por Doenças Cardiovasculares', unit: 'por 100.000 hab', description: 'Óbitos por doenças do aparelho circulatório' },
  { category_index: 0, name: 'Mortalidade por Neoplasias', unit: 'por 100.000 hab', description: 'Óbitos por neoplasias (tumores)' },
  { category_index: 0, name: 'Mortalidade por Causas Externas', unit: 'por 100.000 hab', description: 'Óbitos por acidentes e violência' },

  // Vacinação
  { category_index: 1, name: 'Cobertura Vacinal - BCG', unit: '%', description: 'Cobertura vacinal BCG em menores de 1 ano' },
  { category_index: 1, name: 'Cobertura Vacinal - Poliomielite', unit: '%', description: 'Cobertura vacinal contra poliomielite' },
  { category_index: 1, name: 'Cobertura Vacinal - Tríplice Viral', unit: '%', description: 'Cobertura vacinal tríplice viral (SCR)' },
  { category_index: 1, name: 'Cobertura Vacinal - Hepatite B', unit: '%', description: 'Cobertura vacinal contra Hepatite B' },
  { category_index: 1, name: 'Cobertura Vacinal - Influenza (Idosos)', unit: '%', description: 'Cobertura vacinal contra gripe em idosos 60+' },

  // Morbidade Hospitalar
  { category_index: 2, name: 'Internações por Doenças Respiratórias', unit: 'internações', description: 'Total de internações por doenças do aparelho respiratório' },
  { category_index: 2, name: 'Internações por Doenças Infecciosas', unit: 'internações', description: 'Total de internações por doenças infecciosas e parasitárias' },
  { category_index: 2, name: 'Internações por Causas Externas', unit: 'internações', description: 'Total de internações por lesões e causas externas' },
  { category_index: 2, name: 'Taxa de Internação Hospitalar', unit: 'por 1.000 hab', description: 'Taxa de internação hospitalar geral' },

  // Nascidos Vivos
  { category_index: 3, name: 'Nascidos Vivos', unit: 'nascimentos', description: 'Total de nascidos vivos registrados' },
  { category_index: 3, name: 'Proporção de Nascidos com Baixo Peso', unit: '%', description: 'Nascidos vivos com menos de 2.500g' },
  { category_index: 3, name: 'Proporção de Partos Cesáreos', unit: '%', description: 'Percentual de partos cesáreos' },
  { category_index: 3, name: 'Proporção de Mães Adolescentes', unit: '%', description: 'Nascidos vivos de mães com 10 a 19 anos' },

  // Doenças e Agravos
  { category_index: 4, name: 'Casos de Dengue', unit: 'casos', description: 'Casos notificados de dengue' },
  { category_index: 4, name: 'Casos de Tuberculose', unit: 'casos', description: 'Casos novos de tuberculose notificados' },
  { category_index: 4, name: 'Casos de Hanseníase', unit: 'casos', description: 'Casos novos de hanseníase notificados' },
  { category_index: 4, name: 'Casos de HIV/AIDS', unit: 'casos', description: 'Casos notificados de HIV/AIDS' },
];

const STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];

// Funções para gerar valores realistas baseados nos dados DATASUS
function generateRealisticValue(indicatorName, state, year) {
  const statePop = {
    'SP': 46, 'MG': 21, 'RJ': 17, 'BA': 15, 'PR': 11, 'RS': 11,
    'PE': 9.6, 'CE': 9.2, 'PA': 8.7, 'MA': 7.1, 'SC': 7.3, 'GO': 7.1,
    'AM': 4.2, 'PB': 4, 'ES': 4, 'RN': 3.5, 'AL': 3.3, 'PI': 3.3,
    'MT': 3.5, 'DF': 3, 'MS': 2.8, 'SE': 2.3, 'RO': 1.8, 'TO': 1.6,
    'AC': 0.9, 'AP': 0.9, 'RR': 0.6
  };
  const pop = statePop[state] || 2;
  const rand = () => (Math.random() - 0.5) * 0.3 + 1; // ±15% variação
  const yearTrend = (year - 2015) * 0.02; // leve tendência ao longo do tempo

  switch (indicatorName) {
    case 'Taxa de Mortalidade Infantil':
      return Math.round((14 - yearTrend * 30 + Math.random() * 6) * 10) / 10;
    case 'Taxa de Mortalidade Neonatal':
      return Math.round((9 - yearTrend * 15 + Math.random() * 4) * 10) / 10;
    case 'Mortalidade por Doenças Cardiovasculares':
      return Math.round((150 + Math.random() * 50) * rand());
    case 'Mortalidade por Neoplasias':
      return Math.round((90 + Math.random() * 40 + yearTrend * 50) * rand());
    case 'Mortalidade por Causas Externas':
      return Math.round((70 + Math.random() * 30) * rand());
    case 'Cobertura Vacinal - BCG':
      return Math.round((85 + Math.random() * 15 - (year >= 2020 ? 10 : 0)) * 10) / 10;
    case 'Cobertura Vacinal - Poliomielite':
      return Math.round((80 + Math.random() * 15 - (year >= 2020 ? 12 : 0)) * 10) / 10;
    case 'Cobertura Vacinal - Tríplice Viral':
      return Math.round((78 + Math.random() * 18 - (year >= 2020 ? 15 : 0)) * 10) / 10;
    case 'Cobertura Vacinal - Hepatite B':
      return Math.round((82 + Math.random() * 15 - (year >= 2020 ? 8 : 0)) * 10) / 10;
    case 'Cobertura Vacinal - Influenza (Idosos)':
      return Math.round((70 + Math.random() * 20) * 10) / 10;
    case 'Internações por Doenças Respiratórias':
      return Math.round(pop * 1000 * (8 + Math.random() * 4) * rand() * (year === 2020 ? 1.5 : 1));
    case 'Internações por Doenças Infecciosas':
      return Math.round(pop * 1000 * (5 + Math.random() * 3) * rand());
    case 'Internações por Causas Externas':
      return Math.round(pop * 1000 * (4 + Math.random() * 2) * rand());
    case 'Taxa de Internação Hospitalar':
      return Math.round((45 + Math.random() * 20) * 10) / 10;
    case 'Nascidos Vivos':
      return Math.round(pop * 1000 * (12 + Math.random() * 4) * rand());
    case 'Proporção de Nascidos com Baixo Peso':
      return Math.round((8 + Math.random() * 3) * 10) / 10;
    case 'Proporção de Partos Cesáreos':
      return Math.round((50 + Math.random() * 15 + yearTrend * 20) * 10) / 10;
    case 'Proporção de Mães Adolescentes':
      return Math.round((16 - yearTrend * 20 + Math.random() * 6) * 10) / 10;
    case 'Casos de Dengue':
      return Math.round(pop * 1000 * (3 + Math.random() * 15) * rand() * (year % 2 === 0 ? 1.5 : 0.7));
    case 'Casos de Tuberculose':
      return Math.round(pop * 100 * (3 + Math.random() * 2) * rand());
    case 'Casos de Hanseníase':
      return Math.round(pop * 10 * (2 + Math.random() * 3) * rand());
    case 'Casos de HIV/AIDS':
      return Math.round(pop * 50 * (2 + Math.random() * 2) * rand());
    default:
      return Math.round(Math.random() * 100);
  }
}

async function seed() {
  console.log('Iniciando seed do banco de dados...\n');

  // 1. Inserir categorias
  console.log('Inserindo categorias...');
  const { data: insertedCategories, error: catError } = await supabase
    .from('health_categories')
    .upsert(
      CATEGORIES.map(c => ({ name: c.name, description: c.description, icon: c.icon })),
      { onConflict: 'name' }
    )
    .select();

  if (catError) {
    console.error('Erro ao inserir categorias:', catError.message);
    return;
  }
  console.log(`  ${insertedCategories.length} categorias inseridas`);

  // 2. Inserir indicadores
  console.log('Inserindo indicadores...');
  const indicatorsToInsert = INDICATORS.map(ind => ({
    category_id: insertedCategories[ind.category_index].id,
    name: ind.name,
    unit: ind.unit,
    description: ind.description
  }));

  const { data: insertedIndicators, error: indError } = await supabase
    .from('health_indicators')
    .upsert(indicatorsToInsert, { onConflict: 'name' })
    .select();

  if (indError) {
    console.error('Erro ao inserir indicadores:', indError.message);
    return;
  }
  console.log(`  ${insertedIndicators.length} indicadores inseridos`);

  // 3. Inserir dados
  console.log('Gerando dados de saude...');
  const healthData = [];

  for (const indicator of insertedIndicators) {
    for (const state of STATES) {
      for (const year of YEARS) {
        healthData.push({
          indicator_id: indicator.id,
          state,
          year,
          value: generateRealisticValue(indicator.name, state, year),
          source: 'DATASUS/MS'
        });
      }
    }
  }

  console.log(`  Total de registros: ${healthData.length}`);

  // Inserir em batches de 500
  const BATCH_SIZE = 500;
  for (let i = 0; i < healthData.length; i += BATCH_SIZE) {
    const batch = healthData.slice(i, i + BATCH_SIZE);
    const { error: dataError } = await supabase
      .from('health_data')
      .upsert(batch);

    if (dataError) {
      console.error(`Erro no batch ${i / BATCH_SIZE + 1}:`, dataError.message);
      return;
    }
    process.stdout.write(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(healthData.length / BATCH_SIZE)} inserido\r`);
  }

  console.log('\n\nSeed concluido.');
  console.log(`  ${insertedCategories.length} categorias`);
  console.log(`  ${insertedIndicators.length} indicadores`);
  console.log(`  ${healthData.length} registros de dados`);
  console.log(`  ${STATES.length} estados`);
  console.log(`  ${YEARS.length} anos (${YEARS[0]}-${YEARS[YEARS.length - 1]})`);
}

seed().catch(console.error);
