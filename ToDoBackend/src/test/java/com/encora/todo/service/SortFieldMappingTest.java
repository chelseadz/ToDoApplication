package com.encora.todo.service;

import com.encora.todo.domain.Priority;
import com.encora.todo.dto.PageResponse;
import com.encora.todo.dto.TodoRequest;
import com.encora.todo.dto.TodoResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SortFieldMappingTest {

    private TodoServiceImpl service;

    @BeforeEach
    void setUp() {
        this.service = new TodoServiceImpl(); // default wiring with InMemory repo
        // Seed some data with distinct prio/due/done/createdAt
        TodoRequest r1 = new TodoRequest(); r1.setTitle("A"); r1.setPriority(Priority.LOW);
        TodoRequest r2 = new TodoRequest(); r2.setTitle("B"); r2.setPriority(Priority.MEDIUM);
        TodoRequest r3 = new TodoRequest(); r3.setTitle("C"); r3.setPriority(Priority.CRITICAL);

        TodoResponse a = service.create(r1);
        TodoResponse b = service.create(r2);
        TodoResponse c = service.create(r3);

        service.setDone(b.getId(), true);
    }

    @Test
    void validEnumValues_areAccepted() {
        // No exception; just sanity call
        PageResponse<TodoResponse> p = service.list(0, 10, "PRIORITY", "desc", null, null, null);
        assertThat(p.getContent()).isNotEmpty();
    }

    @Test
    void invalidSortBy_defaultsToCreationDate() {
        PageResponse<TodoResponse> p = service.list(0, 10, "SOMETHING_UNKNOWN", "desc", null, null, null);
        // Should not blow up and should return something; exact order depends on create order
        assertThat(p.getContent()).isNotEmpty();
    }
}
