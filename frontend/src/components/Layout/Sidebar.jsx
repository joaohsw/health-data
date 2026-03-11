import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCategories } from '../../api/client';

export default function Sidebar() {
  const [categories, setCategories] = useState([]);
  const location = useLocation();

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  return (
    <aside className="sidebar">
      <div>
        <h4 className="sidebar-section-title">Navegação</h4>
        <nav className="sidebar-nav">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            <span className="nav-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </span>
            Dashboard
          </Link>
          <Link to="/explorer" className={location.pathname === '/explorer' ? 'active' : ''}>
            <span className="nav-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
            </span>
            Explorar Dados
          </Link>
          <Link to="/map" className={location.pathname === '/map' ? 'active' : ''}>
            <span className="nav-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7Z"/></svg>
            </span>
            Mapa
          </Link>
        </nav>
      </div>

      <div>
        <h4 className="sidebar-section-title">Categorias</h4>
        <nav className="sidebar-nav">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className={location.pathname === `/category/${cat.id}` ? 'active' : ''}
            >
              <span className="nav-icon" style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--gray-400)' }}>{cat.name.charAt(0)}</span>
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-default)' }}>
        <p style={{ fontSize: '0.667rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Fonte: DATASUS / Ministério da Saúde
        </p>
      </div>
    </aside>
  );
}
