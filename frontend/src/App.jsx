import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import DataExplorer from './pages/DataExplorer';
import Categories from './pages/Categories';
import CategoryDetail from './pages/CategoryDetail';
import MapPage from './pages/MapPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <div className="main-area">
          <Header />
          <div style={{ display: 'flex', flex: 1 }}>
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/explorer" element={<DataExplorer />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/category/:id" element={<CategoryDetail />} />
                <Route path="/map" element={<MapPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
