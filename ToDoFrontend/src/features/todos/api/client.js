import axios from 'axios';

const base = () => {
  const env = import.meta?.env || process.env || {};
  
  return env.VITE_API_BASE || env.REACT_APP_API_BASE || 'http://localhost:9090/api';
};

const api = axios.create({
  baseURL: `${base()}/todos`,
  headers: { 'Content-Type': 'application/json' }
});

// DTO mapping helpers (front uses title; map from/to API if needed)
const toCreateDto = ({ title, priority = 'MEDIUM', dueDate }) => ({ title, priority, dueDate });
const toUpdateDto = ({ title, priority, dueDate }) => ({ title, priority, dueDate });


export async function getTodo(id) {
  const { data } = await api.get(`/${id}`);
  return data;
}

const mapSortToField = (by) => {
  switch (by) {
    case 'dueDate':   return 'DUE_DATE';
    case 'priority':  return 'PRIORITY';
    case 'done':      return 'DONE';
    case 'createdAt':
    default:          return 'CREATION_DATE';
  }
};

export async function listTodos({
  page = 1, size = 10, sortBy = 'createdAt', sortDir = 'desc',
  text, priority, done
}) {
  const params = {
    pageNumber: page - 1,
    pageSize: size,
    // send enum to backen
    sortBy: mapSortToField(sortBy),
    sortDir,
    text: text || undefined,
    priority: priority || undefined,
    done: typeof done === 'boolean' ? done : undefined
  };
  const { data } = await api.get('', { params });
  return data;
}

export async function listAll(max = 2000) {
  const { content } = await listTodos({ page: 1, size: max, sortBy: 'createdAt', sortDir: 'desc' });
  return content;
}

export async function createTodo(payload) {
  const { data } = await api.post('', toCreateDto(payload));
  return data;
}

export async function updateTodo(id, payload) {
  const { data } = await api.put(`/${id}`, toUpdateDto(payload));
  return data;
}

export async function toggleDone(id, done) {
  const { data } = await api.patch(`/${id}/done`, null, { params: { done }});
  return data;
}

export async function deleteTodo(id) {
  await api.delete(`/${id}`);
}
