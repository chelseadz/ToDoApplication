package com.encora.todo.repository;

import com.encora.todo.domain.Todo;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

public class InMemoryTodoRepository implements TodoRepository {

    private final Map<Long, Todo> store = new ConcurrentHashMap<>();
    private final AtomicLong seq = new AtomicLong(1000);

    @Override
    public Todo save(Todo todo) {
        if (todo.getId() == null) {
            todo.setId(seq.incrementAndGet());
        }
        store.put(todo.getId(), todo);
        return todo;
    }

    @Override
    public Optional<Todo> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Todo> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public void deleteById(Long id) {
        store.remove(id);
    }

    @Override
    public long count() { return store.size(); }
}
