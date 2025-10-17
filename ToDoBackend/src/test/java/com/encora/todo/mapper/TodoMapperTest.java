package com.encora.todo.mapper;

import com.encora.todo.domain.Priority;
import com.encora.todo.domain.Todo;
import com.encora.todo.dto.TodoRequest;
import com.encora.todo.dto.TodoResponse;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class TodoMapperTest {

    @Test
    void toEntity_mapsBasicFields() {
        TodoRequest req = new TodoRequest();
        req.setTitle("X");
        req.setDescription("desc");
        req.setPriority(Priority.HIGH);
        req.setDueDate(LocalDateTime.now().plusDays(1));

        Todo e = TodoMapper.toEntity(req);
        assertThat(e.getTitle()).isEqualTo("X");
        assertThat(e.getDescription()).isEqualTo("desc");
        assertThat(e.getPriority()).isEqualTo(Priority.HIGH);
        assertThat(e.getDueDate()).isNotNull();
    }

    @Test
    void toResponse_copiesAll() {
        Todo e = new Todo();
        e.setId(123L);
        e.setTitle("X");
        e.setDescription("desc");
        e.setPriority(Priority.CRITICAL);
        e.setDone(true);
        e.setDoneDate(LocalDateTime.now());
        e.setCreatedAt(LocalDateTime.now().minusDays(1));
        e.setUpdatedAt(LocalDateTime.now());
        e.setDueDate(LocalDateTime.now().plusDays(5));

        TodoResponse r = TodoMapper.toResponse(e);
        assertThat(r.getId()).isEqualTo(123L);
        assertThat(r.getTitle()).isEqualTo("X");
        assertThat(r.getDescription()).isEqualTo("desc");
        assertThat(r.getPriority()).isEqualTo(Priority.CRITICAL);
        assertThat(r.isDone()).isTrue();
        assertThat(r.getDoneDate()).isNotNull();
        assertThat(r.getCreatedAt()).isNotNull();
        assertThat(r.getUpdatedAt()).isNotNull();
        assertThat(r.getDueDate()).isNotNull();
    }

    @Test
    void updateEntity_mergesOnlyProvidedFields() {
        Todo e = new Todo();
        e.setTitle("old");
        e.setDescription("old-desc");
        e.setPriority(Priority.LOW);
        e.setDueDate(null);

        TodoRequest patch = new TodoRequest();
        patch.setTitle("new");
        patch.setPriority(Priority.HIGH);
        // description and dueDate left null intentionally

        TodoMapper.updateEntity(e, patch);

        assertThat(e.getTitle()).isEqualTo("new");
        assertThat(e.getPriority()).isEqualTo(Priority.HIGH);
        assertThat(e.getDescription()).isEqualTo("old-desc"); // unchanged
        assertThat(e.getDueDate()).isNull();                  // unchanged
    }
}
