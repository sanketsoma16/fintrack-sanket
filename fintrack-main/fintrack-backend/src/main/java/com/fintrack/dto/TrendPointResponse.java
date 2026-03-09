package com.fintrack.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TrendPointResponse {
    private final LocalDate date;
    private final BigDecimal total;

    public TrendPointResponse(LocalDate date, BigDecimal total) {
        this.date = date;
        this.total = total;
    }

    public LocalDate getDate() {
        return date;
    }

    public BigDecimal getTotal() {
        return total;
    }
}

