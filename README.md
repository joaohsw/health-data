# Health Data

Aplicação web para visualização e exploração de indicadores de saúde do Brasil e do mundo.

## Objetivo

Consolidar dados de saúde em uma interface única, com filtros, tabelas, gráficos e mapas.

## Arquitetura

- `frontend/`: React + Vite para interface e navegação.
- `backend/`: API REST com Express.
- Banco de dados: Supabase (PostgreSQL).

## Funcionalidades

- Dashboard com resumo dos dados.
- Explorador com filtros, paginação e ordenação.
- Catálogo de categorias e indicadores.
- Visualização em mapas (Brasil e mundo).
- Endpoints para dados nacionais e globais.

## Pré-requisitos

- Node.js 18+
- npm
- Projeto e credenciais no Supabase

## Configuração

1. Clone o repositório.
2. Instale as dependências:

```bash
cd backend
npm install

cd ../frontend
npm install
```

3. Crie o arquivo `backend/.env`:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_KEY=SUA_CHAVE_SUPABASE
PORT=3001
```

4. (Opcional) Configure a URL da API no frontend criando `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

Se `VITE_API_URL` não for definido, o frontend usa `http://localhost:3001/api` por padrão.

## Banco de dados

1. Execute o script SQL `backend/src/migration.sql` no SQL Editor do Supabase.
2. Popule dados iniciais (Brasil):

```bash
cd backend
npm run seed
```

3. Popule dados mundiais (WHO/GHO):

```bash
cd backend
npm run seed:world
```

## Execução local

### Backend

```bash
cd backend
npm run dev
```

Servidor em `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm run dev
```

Interface em `http://localhost:5173`.

## Scripts

### Backend (`backend/package.json`)

- `npm run dev`: inicia a API.
- `npm run start`: inicia a API.
- `npm run seed`: popula categorias, indicadores e dados do Brasil.
- `npm run seed:world`: popula países, indicadores e dados mundiais.

### Frontend (`frontend/package.json`)

- `npm run dev`: inicia ambiente de desenvolvimento.
- `npm run build`: gera build de produção.
- `npm run preview`: serve build localmente.

## Rotas principais da API

- `GET /api/health`
- `GET /api/categories`
- `GET /api/categories/:id`
- `GET /api/indicators`
- `GET /api/indicators/:id`
- `GET /api/data`
- `GET /api/data/summary`
- `GET /api/data/chart`
- `GET /api/world/countries`
- `GET /api/world/indicators`
- `GET /api/world/data`
- `GET /api/world/map-data`
- `GET /api/world/country/:code`

## Estrutura de pastas

```text
health-data/
  backend/
    src/
      routes/
      migration.sql
      seed.js
      seed-world.js
      server.js
      supabaseClient.js
  frontend/
    src/
      api/
      components/
      pages/
      App.jsx
      main.jsx
```

## Observações

- O backend depende das variáveis `SUPABASE_URL` e `SUPABASE_KEY` para inicializar.
- O endpoint `GET /api/health` pode ser usado como verificação rápida de disponibilidade da API.
