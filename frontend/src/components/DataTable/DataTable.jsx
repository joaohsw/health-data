import { useState, useMemo } from 'react';

export default function DataTable({
  data = [],
  columns = [],
  loading = false,
  pagination = null,
  onPageChange,
  onSort,
  currentSort = { field: '', order: 'asc' }
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const val = col.accessor(row);
        return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, columns]);

  const handleSort = (field) => {
    if (onSort) {
      const newOrder = currentSort.field === field && currentSort.order === 'asc' ? 'desc' : 'asc';
      onSort(field, newOrder);
    }
  };

  if (loading) {
    return (
      <div className="card table-container">
        <div className="table-toolbar">
          <div className="table-search">
                      <span className="search-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input placeholder="Carregando..." disabled />
          </div>
        </div>
        <div style={{ padding: '0 20px 20px' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card table-container animate-in">
      <div className="table-toolbar">
        <div className="table-search">
                    <span className="search-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
          <input
            type="text"
            placeholder="Buscar nos dados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={currentSort.field === col.sortKey ? 'sorted' : ''}
                  onClick={() => col.sortKey && handleSort(col.sortKey)}
                >
                  {col.header}
                  {col.sortKey && (
                    <span className="sort-indicator">
                      {currentSort.field === col.sortKey
                        ? (currentSort.order === 'asc' ? '↑' : '↓')
                        : '↕'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state">
                    <h3>Nenhum dado encontrado</h3>
                    <p>Tente ajustar os filtros de busca</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <tr key={row.id || index}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="pagination">
          <div className="pagination-info">
            {((pagination.page - 1) * pagination.per_page) + 1}–{Math.min(pagination.page * pagination.per_page, pagination.total)} de {pagination.total?.toLocaleString('pt-BR')}
          </div>
          <div className="pagination-controls">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Anterior
            </button>
            {generatePageNumbers(pagination.page, pagination.total_pages).map((p, i) => (
              <button
                key={i}
                className={p === pagination.page ? 'active' : ''}
                onClick={() => typeof p === 'number' && onPageChange(p)}
                disabled={typeof p !== 'number'}
              >
                {p}
              </button>
            ))}
            <button
              disabled={pagination.page >= pagination.total_pages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function generatePageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('…');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}
