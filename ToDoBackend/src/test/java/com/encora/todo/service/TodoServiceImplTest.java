package com.encora.todo.service;

import com.encora.todo.domain.Priority;
import com.encora.todo.dto.PageResponse;
import com.encora.todo.dto.TodoRequest;
import com.encora.todo.dto.TodoResponse;
import com.encora.todo.repository.InMemoryTodoRepository;
import com.encora.todo.repository.TodoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Locale;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class TodoServiceImplTest {

    private TodoRepository repo;
    private TodoServiceImpl service;

    @BeforeEach
    void setUp() {
        // Use real in-memory repository so we test real persistence semantics
        this.repo = new InMemoryTodoRepository();
        this.service = new TodoServiceImpl(repo);
    }

    private TodoResponse create(String title, Priority prio, LocalDateTime due) {
        TodoRequest req = new TodoRequest();
        req.setTitle(title);
        req.setPriority(prio);
        req.setDueDate(due);
        return service.create(req);
    }

    @Test
    void create_setsTimestamps_andDefaults() {
        TodoResponse r = create("A", Priority.MEDIUM, null);

        assertThat(r.getId()).isNotNull();
        assertThat(r.getCreatedAt()).isNotNull();
        assertThat(r.getUpdatedAt()).isNotNull();
        assertThat(r.isDone()).isFalse();
        assertThat(r.getDoneDate()).isNull();
    }

    @Test
    void getById_returnsItemOrEmpty() {
        TodoResponse saved = create("A", Priority.HIGH, null);

        Optional<TodoResponse> found = service.getById(saved.getId());
        Optional<TodoResponse> missing = service.getById(999999L);

        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("A");
        assertThat(missing).isEmpty();
    }

    @Test
    void update_updatesFields_andTouchesUpdatedAt() throws InterruptedException {
        TodoResponse saved = create("A", Priority.LOW, null);
        LocalDateTime createdAt = saved.getCreatedAt();

        TodoRequest patch = new TodoRequest();
        patch.setTitle("A2");
        patch.setPriority(Priority.CRITICAL);

        // Sleep a tick to ensure updatedAt > previous
        Thread.sleep(5);

        Optional<TodoResponse> updated = service.update(saved.getId(), patch);
        assertThat(updated).isPresent();
        assertThat(updated.get().getTitle()).isEqualTo("A2");
        assertThat(updated.get().getPriority()).isEqualTo(Priority.CRITICAL);
        assertThat(updated.get().getCreatedAt()).isEqualTo(createdAt);
        assertThat(updated.get().getUpdatedAt()).isAfter(createdAt);
    }

    @Test
    void setDone_setsAndClearsDoneDate_andUpdatesUpdatedAt() throws InterruptedException {
        TodoResponse saved = create("A", Priority.MEDIUM, null);

        // done = true
        Optional<TodoResponse> done = service.setDone(saved.getId(), true);
        assertThat(done).isPresent();
        assertThat(done.get().isDone()).isTrue();
        assertThat(done.get().getDoneDate()).isNotNull();

        LocalDateTime afterDoneUpdatedAt = done.get().getUpdatedAt();

        // Ensure updatedAt moves forward
        Thread.sleep(5);

        // done = false
        Optional<TodoResponse> undone = service.setDone(saved.getId(), false);
        assertThat(undone).isPresent();
        assertThat(undone.get().isDone()).isFalse();
        assertThat(undone.get().getDoneDate()).isNull();
        assertThat(undone.get().getUpdatedAt()).isAfter(afterDoneUpdatedAt);
    }

    @Test
    void delete_returnsTrueWhenExisted_falseOtherwise() {
        TodoResponse saved = create("A", Priority.MEDIUM, null);
        boolean first = service.delete(saved.getId());
        boolean second = service.delete(saved.getId());

        assertThat(first).isTrue();
        assertThat(second).isFalse();
    }

    @Test
    void list_filters_text_priority_done() {
        // Prepare
        create("Pay bills", Priority.HIGH, null);
        create("pay parking", Priority.LOW, null);
        TodoResponse r3 = create("Groceries", Priority.MEDIUM, null);
        service.setDone(r3.getId(), true);

        // text filter: "pay"
        PageResponse<TodoResponse> byText = service.list(0, 10, "CREATION_DATE", "desc",
                "pay", null, null);
        assertThat(byText.getContent()).extracting(TodoResponse::getTitle)
                .allMatch(t -> t.toLowerCase(Locale.ROOT).contains("pay"));

        // priority filter: HIGH only
        PageResponse<TodoResponse> byPrio = service.list(0, 10, "CREATION_DATE", "desc",
                null, Priority.HIGH, null);
        assertThat(byPrio.getContent()).extracting(TodoResponse::getPriority)
                .containsOnly(Priority.HIGH);

        // done filter: only done
        PageResponse<TodoResponse> doneOnly = service.list(0, 10, "CREATION_DATE", "desc",
                null, null, true);
        assertThat(doneOnly.getContent()).allMatch(TodoResponse::isDone);
    }

    @Test
    void list_sorts_by_creation_due_priority_done_bothDirections() {
        // CRITICAL is highest, LOW is lowest (adjust if your enum order differs)
        TodoResponse a = create("A", Priority.LOW, LocalDateTime.now().plusDays(3));
        TodoResponse b = create("B", Priority.MEDIUM, LocalDateTime.now().plusDays(2));
        TodoResponse c = create("C", Priority.CRITICAL, LocalDateTime.now().plusDays(1));
        service.setDone(b.getId(), true); // mark one done

        // CREATION_DATE desc ⇒ latest first (c,b,a by creation order)
        PageResponse<TodoResponse> byCreatedDesc = service.list(0, 10, "CREATION_DATE", "desc", null, null, null);
        assertThat(byCreatedDesc.getContent()).extracting(TodoResponse::getTitle)
                .containsExactly("C", "B", "A");

        // DUE_DATE asc ⇒ soonest first (c,b,a by due date proximity)
        PageResponse<TodoResponse> byDueAsc = service.list(0, 10, "DUE_DATE", "asc", null, null, null);
        assertThat(byDueAsc.getContent()).extracting(TodoResponse::getTitle)
                .containsExactly("C", "B", "A");

        // PRIORITY desc ⇒ CRITICAL first (c,b,a)
        PageResponse<TodoResponse> byPrioDesc = service.list(0, 10, "PRIORITY", "desc", null, null, null);
        assertThat(byPrioDesc.getContent()).extracting(TodoResponse::getTitle)
                .containsExactly("C", "B", "A");

        // DONE asc ⇒ false first, then true (A,C) before (B)
        PageResponse<TodoResponse> byDoneAsc = service.list(0, 10, "DONE", "asc", null, null, null);
        assertThat(byDoneAsc.getContent()).extracting(TodoResponse::getTitle)
                .containsExactlyInAnyOrder("A", "C", "B");
        // Ensure ordering groups: not-done first
        boolean allUndoneFirst = byDoneAsc.getContent().stream()
                .map(TodoResponse::isDone)
                .sorted(Comparator.comparing(bol -> bol ? 1 : 0))
                .toList()
                .equals(byDoneAsc.getContent().stream().map(TodoResponse::isDone).toList());
        assertThat(allUndoneFirst).isTrue();
    }

    @Test
    void pagination_correctBounds_andTotals() {
        for (int i = 0; i < 23; i++) {
            create("T" + i, Priority.LOW, null);
        }
        PageResponse<TodoResponse> p1 = service.list(0, 10, "CREATION_DATE", "asc", null, null, null);
        PageResponse<TodoResponse> p3 = service.list(2, 10, "CREATION_DATE", "asc", null, null, null);
        PageResponse<TodoResponse> p4 = service.list(3, 10, "CREATION_DATE", "asc", null, null, null);

        assertThat(p1.getContent()).hasSize(10);
        assertThat(p3.getContent()).hasSize(3);   // 23 total → 3rd page has 3
        assertThat(p1.getTotalPages()).isEqualTo(3);
        assertThat(p4.getContent()).isEmpty();    // out of range returns empty slice
    }
}
