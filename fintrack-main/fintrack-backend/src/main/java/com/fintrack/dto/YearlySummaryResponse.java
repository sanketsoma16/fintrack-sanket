package com.fintrack.dto;

import java.math.BigDecimal;

public class YearlySummaryResponse {
    private final int year;
    private final BigDecimal total;

    public YearlySummaryResponse(int year, BigDecimal total) {
        this.year = year;
        this.total = total;
    }

    public int getYear() {
        return year;
    }

    public BigDecimal getTotal() {
        return total;
    }
}

