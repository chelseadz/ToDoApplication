// BEFORE: labels without htmlFor and inputs without id
// AFTER: accessible associations (id + htmlFor)

import React, { useState } from 'react';

export default function TodoCreateModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [due, setDue] = useState('');

  const canSave = title.trim().length > 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    await onCreate({
      title: title.trim(),
      priority,
      dueDate: due || null,
    });
  };

  return (
    <div className="modalBackground" role="dialog" aria-modal="true">
      <div className="modalContainer">
        <div className="titleCloseBtn">
          <button aria-label="Close" onClick={onClose}>×</button>
        </div>

        <div className="modalTitle">New To-Do</div>

        <div className="modalBody">
          <form className="todo-form" onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="todo-title">Title</label>
              <input
                id="todo-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="todo-priority">Priority</label>
              <select
                id="todo-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option>HIGH</option>
                <option>MEDIUM</option>
                <option>LOW</option>
                <option>CRITICAL</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="todo-due">Due Date (optional)</label>
              <input
                id="todo-due"
                type="datetime-local"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="footer">
          <button id="cancelBtn" type="button" onClick={onClose}>Cancel</button>
          <button id="saveBtn" className="primary" type="submit" formTarget="" onClick={submit} disabled={!canSave}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
