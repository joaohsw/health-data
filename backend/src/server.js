const express = require('express');
const cors = require('cors');
require('dotenv').config();

const categoriesRouter = require('./routes/categories');
const indicatorsRouter = require('./routes/indicators');
const dataRouter = require('./routes/data');
const worldRouter = require('./routes/world');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/indicators', indicatorsRouter);
app.use('/api/data', dataRouter);
app.use('/api/world', worldRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
