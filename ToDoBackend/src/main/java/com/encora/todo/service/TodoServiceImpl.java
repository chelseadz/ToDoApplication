package com.encora.todo.service;

import com.encora.todo.domain.Priority;
import com.encora.todo.domain.SortField;
import com.encora.todo.domain.Todo;
import com.encora.todo.dto.PageResponse;
import com.encora.todo.dto.TodoRequest;
import com.encora.todo.dto.TodoResponse;
import com.encora.todo.mapper.TodoMapper;
import com.encora.todo.repository.InMemoryTodoRepository;
import com.encora.todo.repository.TodoRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TodoServiceImpl implements TodoService {

    private final TodoRepository repo;

    public TodoServiceImpl() {
        // Wire in-memory repo by default. For Spring injection, replace with @Bean in @Configuration and inject here.
        this.repo = new InMemoryTodoRepository();
    }

    public TodoServiceImpl(TodoRepository repo) {
        this.repo = repo;
    }

    @Override
    public TodoResponse create(TodoRequest request) {
        LocalDateTime now = LocalDateTime.now();
        Todo entity = TodoMapper.toEntity(request);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        repo.save(entity);
        return TodoMapper.toResponse(entity);
    }

    @Override
    public Optional<TodoResponse> getById(Long id) {
        return repo.findById(id).map(TodoMapper::toResponse);
    }

    @Override
    public PageResponse<TodoResponse> list(
            int pageNumber,
            int pageSize,
            String sortBy,
            String sortDir,
            String textFilter,
            Priority priorityFilter,
            Boolean doneFilter) {

        // Filter
        List<Todo> all = repo.findAll();
        String needle = textFilter == null ? null : textFilter.toLowerCase(Locale.ROOT);

        List<Todo> filtered = all.stream()
                .filter(t -> needle == null ||
                        (safe(t.getTitle()).toLowerCase(Locale.ROOT).contains(needle)
                                || safe(t.getDescription()).toLowerCase(Locale.ROOT).contains(needle)))
                .filter(t -> priorityFilter == null || t.getPriority() == priorityFilter)
                .filter(t -> doneFilter == null || t.isDone() == doneFilter)
                .collect(Collectors.toList());


        SortField field = parseSortField(sortBy);
        Comparator<Todo> cmp = comparatorFor(field);
        if ("desc".equalsIgnoreCase(sortDir)) cmp = cmp.reversed();
        filtered.sort(cmp);

        int total = filtered.size();

        int from = Math.max(0, Math.min(pageNumber * pageSize, total));
        int to   = Math.max(from, Math.min(from + pageSize, total));

        List<TodoResponse> page = filtered.subList(from, to)
                .stream()
                .map(TodoMapper::toResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(page, pageNumber, pageSize, total);
    }

    @Override
    public Optional<TodoResponse> update(Long id, TodoRequest request) {
        return repo.findById(id).map(entity -> {
            TodoMapper.updateEntity(entity, request);
            entity.setUpdatedAt(LocalDateTime.now());
            repo.save(entity);
            return TodoMapper.toResponse(entity);
        });
    }

    @Override
    public Optional<TodoResponse> setDone(Long id, boolean done) {
        return repo.findById(id).map(entity -> {
            entity.setDone(done);
            entity.setDoneDate(done ? LocalDateTime.now() : null);
            entity.setUpdatedAt(LocalDateTime.now());
            repo.save(entity);
            return TodoMapper.toResponse(entity);
        });
    }

    @Override
    public boolean delete(Long id) {
        boolean exists = repo.findById(id).isPresent();
        if (exists) repo.deleteById(id);
        return exists;
    }

    private static String safe(String s) { return s == null ? "" : s; }

    /** Map request string to enum (supports both new enum names and legacy strings). */
    private static SortField parseSortField(String sortBy) {
        if (sortBy == null) return SortField.CREATION_DATE;

        // try enum first
        try {
            return SortField.valueOf(sortBy.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ignore) {
            // legacy mapping
            return switch (sortBy) {
                case "createdAt", "creationDate", "id" -> SortField.CREATION_DATE;
                case "dueDate" -> SortField.DUE_DATE;
                case "priority" -> SortField.PRIORITY;
                case "done", "isDone" -> SortField.DONE;
                default -> SortField.CREATION_DATE;
            };
        }
    }

    private static Comparator<Todo> comparatorFor(SortField field) {
        return switch (field) {
            case PRIORITY -> Comparator.comparing(Todo::getPriority, Comparator.nullsLast(Comparator.naturalOrder()));
            case DUE_DATE -> Comparator.comparing(Todo::getDueDate, Comparator.nullsLast(Comparator.naturalOrder()));
            case DONE -> Comparator.comparing(Todo::isDone);
            default -> Comparator.comparing(Todo::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()));
        };
    }
}
