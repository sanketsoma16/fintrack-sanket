package com.fintrack.dto;

import java.math.BigDecimal;

public class PredictedExpenseResponse {
    private final BigDecimal predictedAmount;
    private final int monthsConsidered;

    public PredictedExpenseResponse(BigDecimal predictedAmount, int monthsConsidered) {
        this.predictedAmount = predictedAmount;
        this.monthsConsidered = monthsConsidered;
    }

    public BigDecimal getPredictedAmount() {
        return predictedAmount;
    }

    public int getMonthsConsidered() {
        return monthsConsidered;
    }
}

