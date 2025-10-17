import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoFilters from '../TodoFilters.jsx';

test('renders inputs and emits debounced changes', () => {
  jest.useFakeTimers();
  const onChange = jest.fn();

  render(<TodoFilters value={{ text:'', priority:'ALL', state:'ALL' }} onChange={onChange} />);

  fireEvent.change(screen.getByLabelText(/Text/i), { target: { value: 'abc' }});
  fireEvent.change(screen.getByLabelText(/Priority/i), { target: { value: 'HIGH' }});
  fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'DONE' }});

  // Debounce 250ms
  jest.advanceTimersByTime(260);

  expect(onChange).toHaveBeenLastCalledWith({ text: 'abc', priority: 'HIGH', state: 'DONE' });
  jest.useRealTimers();
});
