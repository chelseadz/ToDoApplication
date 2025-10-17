import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  listTodos,
  listAll,
  createTodo as apiCreate,
  updateTodo as apiUpdate,
  toggleDone as apiToggle,
  deleteTodo as apiDelete
} from '../api/client.js';
import { SortBy } from '../types/types.js';

export function useTodos() {
  const [page, setPage] = useState(1);
  
  const [pageSize, setPageSize] = useState(5);

  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ text: '', priority: 'ALL', state: 'ALL' });
  const [sorting, setSorting] = useState({ by: SortBy.CREATED_AT, dir: 'desc' });

  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalized = useMemo(() => ({
    text: filters.text || undefined,
    priority: filters.priority && filters.priority !== 'ALL'
      ? filters.priority.toUpperCase()
      : undefined,
    done: filters.state === 'ALL' ? undefined : (filters.state === 'DONE')
  }), [filters]);

  const fetchPage = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await listTodos({
        // If backend is 0-based, send: page: Math.max(0, page - 1)
        page,
        size: pageSize,
        sortBy: sorting.by,
        sortDir: sorting.dir,
        text: normalized.text,
        priority: normalized.priority,
        done: normalized.done
      });

      // Normalize totalPages to at least 1 so the UI stays sane
      const incomingTP = Number.isFinite(data?.totalPages) ? data.totalPages : 1;
      const nextTotalPages = Math.max(1, incomingTP);

      // If we’re on a page that no longer exists, jump to the last valid one
      if (page > nextTotalPages) {
        setTotalPages(nextTotalPages);
        setItems([]);          // avoid flashing wrong page while we refetch
        setPage(nextTotalPages); // triggers fetchPage again with the clamped page
        return;
      }

      // Normal update
      setItems(Array.isArray(data?.content) ? data.content : []);
      setTotalPages(nextTotalPages);
    } catch (e) {
      setError(e?.message || 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sorting, normalized]);


  const fetchAll = useCallback(async () => {
    try {
      const data = await listAll();
      setAllItems(Array.isArray(data) ? data : []);
    } catch {/* ignore */}
  }, []);

  useEffect(() => { fetchPage(); }, [fetchPage]);
  useEffect(() => { fetchAll(); }, [fetchAll, page, pageSize, sorting, normalized]); // optional


  // Insert new optimistic row respecting current sort (for createdAt sorting common case)
  function insertOptimisticRow(prev, row) {
    const goesTop = sorting.by === SortBy.CREATED_AT && sorting.dir === 'desc';
    if (goesTop) return [row, ...prev];
    return [...prev, row];
  }

  function replaceById(list, id, mapper) {
    return list.map(x => x.id === id ? mapper(x) : x);
  }

  function upsertAllItems(newOrUpdated) {
    setAllItems(prev => {
      const idx = prev.findIndex(x => x.id === newOrUpdated.id);
      if (idx >= 0) {
        const clone = prev.slice();
        clone[idx] = newOrUpdated;
        return clone;
      }
      return [newOrUpdated, ...prev];
    });
  }

  // -------------- CRUD (optimistic) --------------

  const createTodo = async (payload) => {
    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      title: payload.title,
      description: payload.description || null,
      priority: payload.priority || 'MEDIUM',
      done: false,
      doneDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: payload.dueDate || null,
    };

    // Optimistic add (page & metrics)
    setItems(prev => insertOptimisticRow(prev, optimistic));
    setAllItems(prev => [optimistic, ...prev]);

    try {
      const saved = await apiCreate(payload);
      // Swap temp with real in both stores
      setItems(prev => prev.map(x => x.id === tempId ? saved : x));
      setAllItems(prev => prev.map(x => x.id === tempId ? saved : x));
      // fetchPage(); fetchAll();
    } catch (e) {
      // Rollback
      setItems(prev => prev.filter(x => x.id !== tempId));
      setAllItems(prev => prev.filter(x => x.id !== tempId));
      throw e;
    }
  };

  const updateTodo = async (id, patch) => {
    // Snapshot for rollback
    const snapshotItems = items;
    const snapshotAll = allItems;

    // Optimistic merge
    const nowIso = new Date().toISOString();
    setItems(prev => replaceById(prev, id, x => ({ ...x, ...patch, updatedAt: nowIso })));
    setAllItems(prev => replaceById(prev, id, x => ({ ...x, ...patch, updatedAt: nowIso })));

    try {
      const saved = await apiUpdate(id, patch);
      setItems(prev => replaceById(prev, id, () => saved));
      setAllItems(prev => replaceById(prev, id, () => saved));
      // Optional: fetchPage(); fetchAll();
    } catch (e) {
      // Roll back to snapshot
      setItems(snapshotItems);
      setAllItems(snapshotAll);
      throw e;
    }
  };

  const toggleDone = async (id, done) => {
    const snapshotItems = items;
    const snapshotAll = allItems;

    // Optimistic toggle
    const doneDate = done ? new Date().toISOString() : null;
    const updatedAt = new Date().toISOString();
    setItems(prev => replaceById(prev, id, x => ({ ...x, done, doneDate, updatedAt })));
    setAllItems(prev => replaceById(prev, id, x => ({ ...x, done, doneDate, updatedAt })));

    try {
      const saved = await apiToggle(id, done);
      setItems(prev => replaceById(prev, id, () => saved));
      setAllItems(prev => replaceById(prev, id, () => saved));
      
    } catch (e) {
      setItems(snapshotItems);
      setAllItems(snapshotAll);
      throw e;
    }
  };

  const removeTodo = async (id) => {
    const snapshotItems = items;
    const snapshotAll = allItems;

    // Will the current page become empty after this optimistic removal?
    const wasLastItemOnPage = items.length === 1;

    // Optimistic remove
    setItems(prev => prev.filter(x => x.id !== id));
    setAllItems(prev => prev.filter(x => x.id !== id));

    try {
      await apiDelete(id);

      // If it was the last item on this page and we have previous pages,
      // step back one page; fetchPage will run via effect.
      if (wasLastItemOnPage && page > 1) {
        setPage(p => Math.max(1, p - 1));
      }
    } catch (e) {
      // Rollback
      setItems(snapshotItems);
      setAllItems(snapshotAll);
      throw e;
    }
  };


  // Expose the same API the App already uses
  return {
    page, pageSize, totalPages,
    items, allItems,
    filters, sorting,
    isLoading, error,
    setPageSize, setPage, setFilters, setSorting,
    refetch: fetchPage,     // still available if you want a manual reload
    createTodo, updateTodo, toggleDone, removeTodo
  };
}
