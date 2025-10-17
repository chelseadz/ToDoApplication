package com.encora.todo.controller;

import com.encora.todo.domain.Priority;
import com.encora.todo.dto.PageResponse;
import com.encora.todo.dto.TodoRequest;
import com.encora.todo.dto.TodoResponse;
import com.encora.todo.exception.NotFoundException;
import com.encora.todo.service.TodoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    private final TodoService service;

    public TodoController(TodoService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TodoResponse create(@Valid @RequestBody TodoRequest request) {
        return service.create(request);
    }

    @GetMapping("/{id}")
    public TodoResponse get(@PathVariable Long id) {
        return service.getById(id).orElseThrow(() -> new NotFoundException("Todo " + id + " not found"));
    }

    @GetMapping
    public PageResponse<TodoResponse> list(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String text,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Boolean done
    ) {
        return service.list(pageNumber, pageSize, sortBy, sortDir, text, priority, done);
    }

    @PutMapping("/{id}")
    public TodoResponse update(@PathVariable Long id, @Valid @RequestBody TodoRequest request) {
        return service.update(id, request).orElseThrow(() -> new NotFoundException("Todo " + id + " not found"));
    }

    @PatchMapping("/{id}/done")
    public TodoResponse setDone(@PathVariable Long id, @RequestParam boolean done) {
        return service.setDone(id, done).orElseThrow(() -> new NotFoundException("Todo " + id + " not found"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        boolean ok = service.delete(id);
        if (!ok) throw new NotFoundException("Todo " + id + " not found");
    }
}
