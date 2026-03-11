import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getIndicators, getWorldIndicators } from '../api/client';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [worldIndicators, setWorldIndicators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getIndicators(), getWorldIndicators()])
      .then(([cats, inds, worldInds]) => {
        setCategories(cats);
        setIndicators(inds);
        setWorldIndicators(worldInds);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header animate-in">
          <h2>Categorias</h2>
          <p>Carregando...</p>
        </div>
        <div className="categories-grid">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card skeleton" style={{ height: '160px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header animate-in">
        <h2>Categorias</h2>
        <p>Indicadores organizados por fonte de dados</p>
      </div>

      {/* Brasil - DATASUS */}
      <div className="animate-in">
        <h3 style={{ fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Brasil — DATASUS
        </h3>
        <div className="categories-grid" style={{ marginBottom: '32px' }}>
          {categories.map((cat, index) => {
            const catIndicators = indicators.filter(ind => ind.category_id === cat.id);
            return (
              <Link key={cat.id} to={`/category/${cat.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={`card category-card animate-in animate-in-delay-${Math.min(index + 1, 4)}`}>
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                  {catIndicators.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <div className="indicator-count" style={{ marginBottom: '8px' }}>
                        {catIndicators.length} indicadores
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {catIndicators.slice(0, 3).map(ind => (
                          <span key={ind.id} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            · {ind.name}
                          </span>
                        ))}
                        {catIndicators.length > 3 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            +{catIndicators.length - 3} mais
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Global - WHO */}
      <div className="animate-in">
        <h3 style={{ fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Global — OMS (WHO)
        </h3>
        <div className="categories-grid">
          {worldIndicators.map((ind, index) => (
            <Link key={ind.id} to="/map" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={`card category-card animate-in animate-in-delay-${Math.min(index + 1, 4)}`}>
                <h3>{ind.name_pt || ind.name}</h3>
                <p>{ind.description}</p>
                <div style={{ marginTop: '12px' }}>
                  <div className="indicator-count">
                    {ind.unit}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'inline-block' }}>
                    Fonte: WHO Global Health Observatory
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
