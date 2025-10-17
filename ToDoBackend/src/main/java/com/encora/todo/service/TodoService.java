package com.encora.todo.service;

import com.encora.todo.domain.Priority;
import com.encora.todo.dto.PageResponse;
import com.encora.todo.dto.TodoRequest;
import com.encora.todo.dto.TodoResponse;

import java.util.Optional;

public interface TodoService {

    TodoResponse create(TodoRequest request);

    Optional<TodoResponse> getById(Long id);

    PageResponse<TodoResponse> list(
            int pageNumber,
            int pageSize,
            String sortBy,            // id|createdAt|priority|dueDate
            String sortDir,           // asc|desc
            String textFilter,        // search in title/description
            Priority priorityFilter,  // nullable
            Boolean doneFilter        // nullable
    );

    Optional<TodoResponse> update(Long id, TodoRequest request);

    Optional<TodoResponse> setDone(Long id, boolean done);

    boolean delete(Long id);
}
