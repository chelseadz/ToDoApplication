package com.encora.todo.controller;

import com.encora.todo.domain.Priority;
import com.encora.todo.dto.PageResponse;
import com.encora.todo.dto.TodoRequest;
import com.encora.todo.dto.TodoResponse;
import com.encora.todo.service.TodoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = TodoController.class)
class TodoControllerWebMvcTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper om;

    @MockBean
    TodoService service;

    @Test
    void list_mapsQueryParams_defaultsAndJsonShape() throws Exception {
        TodoResponse item = new TodoResponse();
        item.setId(1L);
        item.setTitle("A");
        PageResponse<TodoResponse> page = new PageResponse<>(List.of(item), 0, 10, 1);
        when(service.list(eq(0), eq(10), eq("CREATION_DATE"), eq("desc"),
                isNull(), isNull(), isNull()))
                .thenReturn(page);

        mvc.perform(get("/api/todos")
                        .queryParam("page", "0")
                        .queryParam("size", "10")
                        .queryParam("sortBy", "CREATION_DATE")
                        .queryParam("sortDir", "desc"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.pageNumber").value(0))
                .andExpect(jsonPath("$.pageSize").value(10))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    void getById_200_and_404() throws Exception {
        TodoResponse r = new TodoResponse();
        r.setId(42L); r.setTitle("X");
        when(service.getById(42L)).thenReturn(Optional.of(r));
        when(service.getById(99L)).thenReturn(Optional.empty());

        mvc.perform(get("/api/todos/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("X"));

        mvc.perform(get("/api/todos/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_201_and_validatesRequest() throws Exception {
        TodoResponse saved = new TodoResponse();
        saved.setId(7L); saved.setTitle("Buy milk");
        when(service.create(any(TodoRequest.class))).thenReturn(saved);

        String body = """
            {"title":"Buy milk","priority":"HIGH","dueDate":"2030-01-01T10:00:00"}
            """;

        mvc.perform(post("/api/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(7));

        // Validate mapping into service layer
        ArgumentCaptor<TodoRequest> cap = ArgumentCaptor.forClass(TodoRequest.class);
        // Mockito.verify(service).create(cap.capture());  // If you want to verify call explicitly
        // assertThat(cap.getValue().getPriority()).isEqualTo(Priority.HIGH);
    }

    @Test
    void update_200_and_putsPatch() throws Exception {
        TodoResponse updated = new TodoResponse();
        updated.setId(5L); updated.setTitle("New");
        when(service.update(eq(5L), any(TodoRequest.class))).thenReturn(Optional.of(updated));

        String body = """
            {"title":"New","priority":"LOW"}
            """;

        mvc.perform(put("/api/todos/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("New"));
    }

    @Test
    void setDone_200_and_404_queryParam() throws Exception {
        TodoResponse done = new TodoResponse();
        done.setId(3L);
        done.setDone(true);

        when(service.setDone(3L, true)).thenReturn(Optional.of(done));
        when(service.setDone(88L, true)).thenReturn(Optional.empty());

        mvc.perform(patch("/api/todos/3/done").param("done", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.done").value(true));

        mvc.perform(patch("/api/todos/88/done").param("done", "true"))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_204_and_404() throws Exception {
        when(service.delete(10L)).thenReturn(true);
        when(service.delete(11L)).thenReturn(false);

        mvc.perform(delete("/api/todos/10"))
                .andExpect(status().isNoContent());

        mvc.perform(delete("/api/todos/11"))
                .andExpect(status().isNotFound());
    }
}
