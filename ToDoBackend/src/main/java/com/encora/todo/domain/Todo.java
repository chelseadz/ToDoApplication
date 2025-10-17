package com.encora.todo.domain;


import java.time.LocalDateTime;
import java.util.Objects;

public class Todo {
    private Long id;
    private String title;
    private String description;
    private Priority priority;
    private LocalDateTime dueDate;
    private boolean done;
    private LocalDateTime doneDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Todo() {}

    public Todo(Long id, String title, String description, Priority priority,
                LocalDateTime dueDate, boolean done, LocalDateTime doneDate,
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.dueDate = dueDate;
        this.done = done;
        this.doneDate = doneDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters/Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public boolean isDone() { return done; }
    public void setDone(boolean done) { this.done = done; }

    public LocalDateTime getDoneDate() { return doneDate; }
    public void setDoneDate(LocalDateTime doneDate) { this.doneDate = doneDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Todo)) return false;
        Todo todo = (Todo) o;
        return Objects.equals(id, todo.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }
}
