// Path: src/features/todos/components/__tests__/TodoTable.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoTable from '../TodoTable';
import { SortBy } from '../../types/types';

const items = [
  { id: 1, title: 'A', priority: 'LOW', dueDate: null, createdAt: '2025-10-15T00:00:00Z', done: false },
  { id: 2, title: 'B', priority: 'HIGH', dueDate: '2025-10-20T00:00:00Z', createdAt: '2025-10-14T00:00:00Z', done: true },
];

test('renders rows and toggles sorting via header buttons with aria-sort', () => {
  const onSortingChange = jest.fn();
  render(
    <TodoTable
      items={items}
      sorting={{ by: SortBy.CREATED_AT, dir: 'desc' }}
      onSortingChange={onSortingChange}
      onToggleDone={jest.fn()}
      onEdit={jest.fn()}
      onDelete={jest.fn()}
      loading={false}
      error={null}
    />
  );

  // Headers exist
  const dueHeader = screen.getByRole('columnheader', { name: /Due Date/i });
  expect(dueHeader).toHaveAttribute('aria-sort', 'none');

  // Click the button inside header to toggle sort
  fireEvent.click(screen.getByRole('button', { name: /Due Date sort none/i }));
  expect(onSortingChange).toHaveBeenCalledWith({ by: SortBy.DUE_DATE, dir: 'asc' });
});
