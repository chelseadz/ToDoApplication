import React from 'react';

export default function TodoPagination({ page, totalPages, onChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="pagination-container">
      <div className="pagination">
        <button className="navigation-button" disabled={page <= 1} onClick={() => onChange(page - 1)}>&laquo;</button>
        {pages.map(p => (
          <button key={p} className={p === page ? 'active' : ''} onClick={() => onChange(p)}>{p}</button>
        ))}
        <button className="navigation-button" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>&raquo;</button>
      </div>
    </div>
  );
}

