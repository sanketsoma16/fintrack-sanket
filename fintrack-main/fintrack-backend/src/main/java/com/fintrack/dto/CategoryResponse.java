package com.fintrack.dto;

public class CategoryResponse {
    private final Long id;
    private final String name;
    private final String description;
    private final boolean isDefault;

    public CategoryResponse(Long id, String name, String description, boolean isDefault) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isDefault = isDefault;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public boolean isDefault() {
        return isDefault;
    }
}

