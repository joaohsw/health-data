-- ============================================
-- SQL para criar as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS health_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Indicadores
CREATE TABLE IF NOT EXISTS health_indicators (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT REFERENCES health_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE,
  unit TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Dados
CREATE TABLE IF NOT EXISTS health_data (
  id BIGSERIAL PRIMARY KEY,
  indicator_id BIGINT REFERENCES health_indicators(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  year INTEGER NOT NULL,
  value NUMERIC NOT NULL,
  source TEXT DEFAULT 'DATASUS/MS',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_health_data_indicator ON health_data(indicator_id);
CREATE INDEX IF NOT EXISTS idx_health_data_state ON health_data(state);
CREATE INDEX IF NOT EXISTS idx_health_data_year ON health_data(year);
CREATE INDEX IF NOT EXISTS idx_health_indicators_category ON health_indicators(category_id);

-- Habilitar RLS (Row Level Security) - leitura pública
ALTER TABLE health_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso - permitir leitura pública
CREATE POLICY "Allow public read access" ON health_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON health_indicators FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON health_data FOR SELECT USING (true);

-- Políticas de INSERT para o seed (usando anon key)
CREATE POLICY "Allow insert" ON health_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON health_indicators FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON health_data FOR INSERT WITH CHECK (true);

-- ============================================
-- Tabelas para dados mundiais (WHO/GHO)
-- ============================================

-- Paises
CREATE TABLE IF NOT EXISTS countries (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_pt TEXT,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indicadores mundiais
CREATE TABLE IF NOT EXISTS world_indicators (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_pt TEXT,
  unit TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dados mundiais
CREATE TABLE IF NOT EXISTS world_data (
  id BIGSERIAL PRIMARY KEY,
  indicator_id BIGINT REFERENCES world_indicators(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  year INTEGER NOT NULL,
  value NUMERIC NOT NULL,
  source TEXT DEFAULT 'WHO/GHO',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_world_data_indicator ON world_data(indicator_id);
CREATE INDEX IF NOT EXISTS idx_world_data_country ON world_data(country_code);
CREATE INDEX IF NOT EXISTS idx_world_data_year ON world_data(year);
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);

-- RLS
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON countries FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON world_indicators FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON world_data FOR SELECT USING (true);

CREATE POLICY "Allow insert" ON countries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON world_indicators FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON world_data FOR INSERT WITH CHECK (true);
