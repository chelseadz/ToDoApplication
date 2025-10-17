// Path: src/features/todos/__tests__/useTodos.test.jsx
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useTodos } from '../hooks/useTodos';

// Mock the API client functions used by the hook
jest.mock('../api/client.js', () => ({
  listTodos: jest.fn(),
  listAll: jest.fn(),
  createTodo: jest.fn(),
  updateTodo: jest.fn(),
  toggleDone: jest.fn(),
  deleteTodo: jest.fn(),
}));

import {
  listTodos,
  listAll,
  createTodo,
  updateTodo,
  toggleDone,
  deleteTodo,
} from '../api/client.js';

function makePage(content, totalPages = 1) {
  return { content, totalPages };
}

describe('useTodos hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  test('optimistic create success & rollback on failure', async () => {
    listTodos.mockResolvedValue(makePage([], 1));
    listAll.mockResolvedValue([]);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    // Success path
    const payload = { title: 'New task' };
    createTodo.mockResolvedValue({ id: 101, title: 'New task', createdAt: new Date().toISOString() });

    await act(async () => {
      await result.current.createTodo(payload);
    });
    expect(result.current.items.some(x => x.id === 101)).toBe(true);

    // Failure path: ensure rollback
    const payload2 = { title: 'Fail task' };
    createTodo.mockRejectedValueOnce(new Error('boom'));

    const beforeCount = result.current.items.length;
    await expect(act(async () => {
      await result.current.createTodo(payload2);
    })).rejects.toThrow('boom');
    expect(result.current.items.length).toBe(beforeCount); // rolled back
  });

  test('delete last row on page steps back a page', async () => {
    // Page 2 with one item; deleting it should go back to page 1
    listTodos
      .mockResolvedValueOnce(makePage([{ id: 2, title: 'P2 only' }], 2)) // initial load page=1 (we’ll navigate)
      .mockResolvedValueOnce(makePage([{ id: 2, title: 'P2 only' }], 2)) // when setPage(2)
      .mockResolvedValueOnce(makePage([{ id: 1, title: 'P1 data' }], 1)); // after step-back

    listAll.mockResolvedValue([]);

    const { result } = renderHook(() => useTodos());
    await act(async () => {});

    await act(async () => {
      result.current.setPage(2);
    });

    deleteTodo.mockResolvedValueOnce(undefined);

    await act(async () => {
      await result.current.removeTodo(2);
    });

    // Hook should step back to page 1; a refetch will run via effect
    expect(result.current.page).toBe(1);
  });
});
