package com.fintrack.dto;

import java.math.BigDecimal;

public class CategorySummaryResponse {
    private final Long categoryId;
    private final String categoryName;
    private final BigDecimal total;

    public CategorySummaryResponse(Long categoryId, String categoryName, BigDecimal total) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.total = total;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public BigDecimal getTotal() {
        return total;
    }
}

