package com.fintrack.dto;

import java.math.BigDecimal;

public class MonthlySummaryResponse {
    private final int year;
    private final int month;
    private final BigDecimal total;

    public MonthlySummaryResponse(int year, int month, BigDecimal total) {
        this.year = year;
        this.month = month;
        this.total = total;
    }

    public int getYear() {
        return year;
    }

    public int getMonth() {
        return month;
    }

    public BigDecimal getTotal() {
        return total;
    }
}

