package com.encora.todo.repository;

import com.encora.todo.domain.Todo;

import java.util.List;
import java.util.Optional;

public interface TodoRepository {
    Todo save(Todo todo);
    Optional<Todo> findById(Long id);
    List<Todo> findAll();
    void deleteById(Long id);
    long count();
}
