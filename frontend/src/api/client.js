import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Categories
export const getCategories = () => api.get('/categories').then(res => res.data);
export const getCategory = (id) => api.get(`/categories/${id}`).then(res => res.data);

// Indicators
export const getIndicators = (params) => api.get('/indicators', { params }).then(res => res.data);
export const getIndicator = (id) => api.get(`/indicators/${id}`).then(res => res.data);

// Data
export const getData = (params) => api.get('/data', { params }).then(res => res.data);
export const getDataSummary = () => api.get('/data/summary').then(res => res.data);
export const getChartData = (params) => api.get('/data/chart', { params }).then(res => res.data);

// World
export const getWorldCountries = (params) => api.get('/world/countries', { params }).then(res => res.data);
export const getWorldIndicators = () => api.get('/world/indicators').then(res => res.data);
export const getWorldData = (params) => api.get('/world/data', { params }).then(res => res.data);
export const getWorldMapData = (params) => api.get('/world/map-data', { params }).then(res => res.data);
export const getWorldCountryDetail = (code) => api.get(`/world/country/${code}`).then(res => res.data);

export default api;
