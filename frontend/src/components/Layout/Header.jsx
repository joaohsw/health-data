import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || (path === '/map' && location.pathname.startsWith('/map')) ? 'active' : '';

  return (
    <header className="header">
      <div className="header-logo">
        <div className="header-logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
        </div>
        <h1>SaúdeBR</h1>
        <span>DATASUS</span>
      </div>
      <nav className="header-nav">
        <Link to="/" className={isActive('/')}>Dashboard</Link>
        <Link to="/explorer" className={isActive('/explorer')}>Explorar Dados</Link>
        <Link to="/categories" className={isActive('/categories')}>Categorias</Link>
        <Link to="/map" className={isActive('/map')}>Mapa</Link>
      </nav>
    </header>
  );
}
