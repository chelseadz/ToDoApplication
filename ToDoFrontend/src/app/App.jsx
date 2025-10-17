import React, { useState } from 'react';
import '../styles/app.css';

import { useTodos } from '../features/todos/hooks/useTodos';
import TodoFilters from '../features/todos/components/TodoFilters';
import TodoCreateModal from '../features/todos/components/TodoCreateModal';
import TodoEditModal from '../features/todos/components/TodoEditModal';
import TodoTable from '../features/todos/components/TodoTable';
import TodoPagination from '../features/todos/components/TodoPagination';
import TodoMetrics from '../features/todos/components/TodoMetrics';
import TodoControls from '../features/todos/components/TodoControls';

export default function App() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState(null);


  const { page, pageSize, totalPages, items, filters, sorting, isLoading, error,
         setPage, setPageSize, setFilters, setSorting,
         createTodo, updateTodo, toggleDone, removeTodo, allItems } = useTodos();

return (
  <div className="App">
    <h1>ToDo App</h1>

    <TodoFilters
      value={filters}
      onChange={setFilters}
    />

     <TodoControls
      onCreate={() => setCreateOpen(true)}
      pageSize={pageSize}
      onChangePageSize={(n) => { setPageSize(n); setPage(1); }}
    />

    {createOpen && (
      <TodoCreateModal
        onClose={() => setCreateOpen(false)}
        onCreate={async (payload) => { await createTodo(payload); setCreateOpen(false); }}
      />
    )}

    {editId != null && (
      <TodoEditModal
        id={editId}
        onClose={() => setEditId(null)}
        onSave={async (payload) => { await updateTodo(editId, payload); setEditId(null); }}
      />
    )}

    <TodoTable
      items={items}
      sorting={sorting}
      onSortingChange={setSorting}
      onToggleDone={toggleDone}
      onEdit={setEditId}
      onDelete={removeTodo}
      loading={isLoading}
      error={error}
    />

    <TodoPagination
      page={page}
      totalPages={totalPages}
      onChange={setPage}
    />

    <TodoMetrics data={allItems} />
  </div>
);

}
