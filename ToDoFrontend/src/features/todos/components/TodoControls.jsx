import React from 'react';
import '../../../styles/app.css'; // keep existing styles

/**
 * Props:
 * - onCreate: () => void
 * - pageSize: number
 * - onChangePageSize: (n: number) => void
 */
export default function TodoControls({ onCreate, pageSize, onChangePageSize }) {
  return (
    <div className="newtask-container" style={{ gap: 6, width: '60%', maxWidth: 960, margin: '8px auto' }}>
      <button className="primary" onClick={onCreate}>
        + New To-Do
      </button>

      <div style={{ flex: 1 }} />

      <label htmlFor="pageSize" className="controls-label">Page size:</label>
      <select
        id="pageSize"
        value={pageSize}
        onChange={(e) => onChangePageSize(Number(e.target.value))}
        aria-label="Select page size"
        className="controls-select"
      >
        {[5, 10, 20, 50, 100].map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}
