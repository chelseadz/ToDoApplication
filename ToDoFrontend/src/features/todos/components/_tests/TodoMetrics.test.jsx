import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import TodoMetrics from '../TodoMetrics';

function mk(createdAt, doneDate, priority = 'MEDIUM') {
  return { id: Math.random(), title: 't', createdAt, doneDate, priority, done: !!doneDate };
}

test('renders aggregated metrics with formatted durations', async () => {
  const base = new Date('2025-10-15T00:00:00Z');
  const data = [
    mk(base.toISOString(), new Date(base.getTime() + 30 * 1000).toISOString(), 'LOW'),        // 30s
    mk(base.toISOString(), new Date(base.getTime() + 3 * 60 * 1000).toISOString(), 'HIGH'),   // 3m
    mk(base.toISOString(), new Date(base.getTime() + 26 * 60 * 60 * 1000).toISOString(), 'MEDIUM'),  // 1d 2h
  ];

  // Wrap render in React.act to avoid the deprecated TestUtils.act warning
  await act(async () => {
    render(<TodoMetrics data={data} />);
  });

  // Disambiguate labels by using exact text (with the colon)
  expect(screen.getByText('Average time to finish tasks:', { exact: true })).toBeInTheDocument();
  expect(screen.getByText('Average time to finish tasks by priority:', { exact: true })).toBeInTheDocument();

  // A couple of sanity checks on formatted outputs (don’t overfit exact averages)
  // These values appear in your current render; adjust if your formatter changes
  expect(screen.getByText(/30s/)).toBeInTheDocument();
  expect(screen.getByText(/3m/)).toBeInTheDocument();
  expect(screen.getByText(/1d 2h/)).toBeInTheDocument();
});
