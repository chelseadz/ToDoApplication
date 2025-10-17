package com.encora.todo.dto;

import com.encora.todo.domain.Priority;

import java.time.LocalDateTime;

public class TodoResponse {
    private Long id;
    private String title;
    private String description;
    private Priority priority;
    private LocalDateTime dueDate;
    private boolean done;
    private LocalDateTime doneDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TodoResponse() {}

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
}
