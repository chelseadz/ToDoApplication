package com.encora.todo.mapper;

import com.encora.todo.domain.Todo;
import com.encora.todo.dto.TodoRequest;
import com.encora.todo.dto.TodoResponse;

public class TodoMapper {

    public static Todo toEntity(TodoRequest req) {
        Todo t = new Todo();
        t.setTitle(req.getTitle());
        t.setDescription(req.getDescription());
        t.setPriority(req.getPriority());
        t.setDueDate(req.getDueDate());
        t.setDone(false);
        return t;
    }

    public static void updateEntity(Todo t, TodoRequest req) {
        if (req.getTitle() != null) t.setTitle(req.getTitle());
        if (req.getDescription() != null) t.setDescription(req.getDescription());
        if (req.getPriority() != null) t.setPriority(req.getPriority());
        if (req.getDueDate() != null) t.setDueDate(req.getDueDate());
    }

    public static TodoResponse toResponse(Todo t) {
        TodoResponse r = new TodoResponse();
        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setPriority(t.getPriority());
        r.setDueDate(t.getDueDate());
        r.setDone(t.isDone());
        r.setDoneDate(t.getDoneDate());
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());
        return r;
    }
}
