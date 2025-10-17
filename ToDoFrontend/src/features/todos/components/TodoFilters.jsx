import React, { useState, useEffect } from 'react';

export default function TodoFilters({ value, onChange }) {
  const [text, setText] = useState(value.text || '');
  const [priority, setPriority] = useState(value.priority || 'ALL');
  const [state, setState] = useState(value.state || 'ALL');

  // debounce small inputs to reduce refetch frequency
  useEffect(() => {
    const t = setTimeout(() => onChange({ text, priority, state }), 250);
    return () => clearTimeout(t);
  }, [text, priority, state, onChange]);

  return (
    <form className="search-form" onSubmit={(e) => e.preventDefault()}>
      <div className="form-group">
        <label htmlFor="text">Text</label>
        <input id="text" placeholder="search" value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      <div className="form-group">
        <label htmlFor="priority">Priority</label>
        <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="ALL">All</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="state">State</label>
        <select id="state" value={state} onChange={(e) => setState(e.target.value)}>
          <option value="ALL">All</option>
          <option value="DONE">Done</option>
          <option value="UNDONE">Undone</option>
        </select>
      </div>
    </form>
  );
}
