// Path: src/features/todos/components/__tests__/TodoPagination.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoPagination from '../TodoPagination';

test('pagination buttons enable/disable and change page', () => {
  const onChange = jest.fn();
  render(<TodoPagination page={1} totalPages={3} onChange={onChange} />);

  // Prev disabled on first page
  expect(screen.getByRole('button', { name: /«/ })).toBeDisabled();

  fireEvent.click(screen.getByRole('button', { name: /»/ }));
  expect(onChange).toHaveBeenCalled();
});
