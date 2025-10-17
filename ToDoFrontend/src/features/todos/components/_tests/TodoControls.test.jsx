// Path: src/features/todos/components/__tests__/TodoControls.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoControls from '../TodoControls';

test('invokes create and page size change', () => {
  const onCreate = jest.fn();
  const onChangePageSize = jest.fn();

  render(<TodoControls onCreate={onCreate} pageSize={10} onChangePageSize={onChangePageSize} />);

  fireEvent.click(screen.getByRole('button', { name: /\+ New To-Do/i }));
  expect(onCreate).toHaveBeenCalled();

  fireEvent.change(screen.getByLabelText(/Page size/i), { target: { value: '20' } });
  expect(onChangePageSize).toHaveBeenCalledWith(20);
});
