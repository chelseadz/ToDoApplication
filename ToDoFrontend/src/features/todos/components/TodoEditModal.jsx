import React, { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import { getTodo } from '../api/client';

export default function TodoEditModal({ id, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    (async () => {
      const todo = await getTodo(id);
      setTitle(todo.title || '');
      setPriority(todo.priority || 'MEDIUM');
      setDueDate(todo.dueDate ? todo.dueDate.slice(0,16) : '');
    })();
  }, [id]);

  return (
    <Modal title="Edit To-Do" onClose={onClose} footer={
      <>
        <button onClick={onClose} id="cancelBtn">Cancel</button>
        <button className="primary" id="saveBtn" onClick={() => onSave({ title, priority, dueDate: dueDate || null })} disabled={!title.trim()}>
          Save
        </button>
      </>
    }>
      <form className="todo-update-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option>HIGH</option>
            <option>MEDIUM</option>
            <option>LOW</option>
            <option>CRITICAL</option>
          </select>
        </div>
        <div className="form-group">
          <label>Due Date (optional)</label>
          <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}
