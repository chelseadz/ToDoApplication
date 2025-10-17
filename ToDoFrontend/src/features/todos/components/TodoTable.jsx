import React from 'react';
import { SortBy } from '../types/types';

function trafficColor(dueDate) {
  if (!dueDate) return '';
  const now = new Date();
  const due = new Date(dueDate);
  const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (days <= 7) return 'red';
  if (days <= 14) return 'yellow';
  return 'green';
}

function formatDateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  // es-MX with 24-hour time; adjust options to taste
  return d.toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Small helper to render a sort button in a TH */
function SortHeader({ label, column, sorting, onSortingChange }) {
  const isActive = sorting?.by === column;
  const dir = isActive ? sorting.dir : undefined;

  const icon = !isActive ? '↕' : dir === 'asc' ? '▲' : '▼';
  const ariaSort = !isActive ? 'none' : dir === 'asc' ? 'ascending' : 'descending';

  function handleClick() {
    if (!isActive) onSortingChange({ by: column, dir: 'asc' });
    else onSortingChange({ by: column, dir: dir === 'asc' ? 'desc' : 'asc' });
  }

  return (
    <th className="table-header" aria-sort={ariaSort} scope="col">
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isActive}
        aria-label={`${label} sort ${isActive ? dir : 'none'}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'transparent',
          border: 0,
          padding: 0,
          cursor: 'pointer',
          font: 'inherit',
          color: 'inherit',
        }}
        title={isActive ? `${label} (${dir})` : `Sort by ${label}`}
      >
        <span>{label}</span>
        <span aria-hidden="true">{icon}</span>
      </button>
    </th>
  );
}

export default function TodoTable({
  items,
  sorting,
  onSortingChange,
  onToggleDone,
  onEdit,
  onDelete,
  loading,
  error,
}) {
  return (
    <div className="container">
      <table className="styled-table">
        <thead>
          <tr>
            <SortHeader
              label="Done"
              column={SortBy.DONE}
              sorting={sorting}
              onSortingChange={onSortingChange}
            />
            <th className="table-header">Name</th>
            <SortHeader
              label="Priority"
              column={SortBy.PRIORITY}
              sorting={sorting}
              onSortingChange={onSortingChange}
            />
            <SortHeader
              label="Due Date"
              column={SortBy.DUE_DATE}
              sorting={sorting}
              onSortingChange={onSortingChange}
            />
            <SortHeader
              label="Creation Time"
              column={SortBy.CREATED_AT}
              sorting={sorting}
              onSortingChange={onSortingChange}
            />
            <th className="table-header" aria-sort="none"></th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr><td colSpan={6}>Loading…</td></tr>
          )}

          {error && !loading && (
            <tr><td colSpan={6}>Error: {String(error)}</td></tr>
          )}

          {!loading && !error && items.map((row) => {
            const due = row.dueDate ? formatDateTime(row.dueDate) : '';
            const created = formatDateTime(row.createdAt);
            const bg = trafficColor(row.dueDate);
            const line = row.done ? 'line-through' : 'none';
            return (
              <tr key={row.id} style={{ backgroundColor: bg, textDecoration: line }} className="table-row">
                <td className="table-cell">
                  <input
                    type="checkbox"
                    checked={row.done}
                    onChange={(e) => onToggleDone(row.id, e.target.checked)}
                    aria-label={`Toggle done for "${row.title}"`}
                  />
                </td>
                <td className="table-cell">{row.title}</td>
                <td className="table-cell">{row.priority}</td>
                <td className="table-cell">{due}</td>
                <td className="table-cell">{created}</td>
                <td className="table-cell">
                  <button type="button" onClick={() => onEdit(row.id)}>Edit</button>
                  <button type="button" onClick={() => onDelete(row.id)}>Delete</button>
                </td>
              </tr>
            );
          })}

          {!loading && !error && items.length === 0 && (
            <tr><td colSpan={6}>No results</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
