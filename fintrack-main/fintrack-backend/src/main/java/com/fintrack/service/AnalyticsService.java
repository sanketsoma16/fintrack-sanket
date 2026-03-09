package com.fintrack.service;

import com.fintrack.dto.CategorySummaryResponse;
import com.fintrack.dto.MonthlySummaryResponse;
import com.fintrack.dto.PredictedExpenseResponse;
import com.fintrack.dto.TrendPointResponse;
import com.fintrack.dto.YearlySummaryResponse;
import com.fintrack.exceptions.ResourceNotFoundException;
import com.fintrack.model.Category;
import com.fintrack.model.Expense;
import com.fintrack.model.User;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.ExpenseRepository;
import com.fintrack.repository.UserRepository;
import com.fintrack.utils.SecurityUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public AnalyticsService(ExpenseRepository expenseRepository,
                            CategoryRepository categoryRepository,
                            UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public List<MonthlySummaryResponse> getMonthlySummary() {
        User user = getCurrentUser();
        LocalDate start = LocalDate.now().minusMonths(12).withDayOfMonth(1);
        LocalDate end = LocalDate.now();
        List<Expense> expenses = expenseRepository.findAllByUserAndDateBetween(user, start, end);
        Map<YearMonth, BigDecimal> grouped = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> YearMonth.from(e.getDate()),
                        Collectors.mapping(Expense::getAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));
        return grouped.entrySet().stream()
                .map(entry -> new MonthlySummaryResponse(
                        entry.getKey().getYear(),
                        entry.getKey().getMonthValue(),
                        entry.getValue()))
                .sorted(Comparator.comparing(MonthlySummaryResponse::getYear)
                        .thenComparing(MonthlySummaryResponse::getMonth))
                .collect(Collectors.toList());
    }

    public List<YearlySummaryResponse> getYearlySummary() {
        User user = getCurrentUser();
        LocalDate start = LocalDate.now().minusYears(5).withDayOfYear(1);
        LocalDate end = LocalDate.now();
        List<Expense> expenses = expenseRepository.findAllByUserAndDateBetween(user, start, end);
        Map<Year, BigDecimal> grouped = expenses.stream()
                .collect(Collectors.groupingBy(
                        expense -> Year.of(expense.getDate().getYear()),
                        Collectors.mapping(Expense::getAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));
        return grouped.entrySet().stream()
                .map(entry -> new YearlySummaryResponse(
                        entry.getKey().getValue(),
                        entry.getValue()))
                .sorted(Comparator.comparingInt(YearlySummaryResponse::getYear))
                .collect(Collectors.toList());
    }

    public List<CategorySummaryResponse> getCategorySummary(int year, int month) {
        User user = getCurrentUser();
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        List<Expense> expenses = expenseRepository.findAllByUserAndDateBetween(user, start, end);
        Map<Long, BigDecimal> grouped = expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategoryId,
                        Collectors.mapping(Expense::getAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));
        return grouped.entrySet().stream()
                .map(entry -> new CategorySummaryResponse(
                        entry.getKey(),
                        resolveCategoryName(entry.getKey()),
                        entry.getValue()))
                .sorted(Comparator.comparing(CategorySummaryResponse::getTotal).reversed())
                .collect(Collectors.toList());
    }

    private String resolveCategoryName(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .map(Category::getName)
                .orElse("Unknown");
    }

    public List<TrendPointResponse> getTrends() {
        User user = getCurrentUser();
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusMonths(6);
        List<Expense> expenses = expenseRepository.findAllByUserAndDateBetween(user, start, end);
        Map<LocalDate, BigDecimal> grouped = expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getDate,
                        Collectors.mapping(Expense::getAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));
        return grouped.entrySet().stream()
                .map(entry -> new TrendPointResponse(
                        entry.getKey(),
                        entry.getValue()))
                .sorted(Comparator.comparing(TrendPointResponse::getDate))
                .collect(Collectors.toList());
    }

    public PredictedExpenseResponse getPredictedExpense() {
        List<MonthlySummaryResponse> monthlySummaries = getMonthlySummary();
        int n = monthlySummaries.size();
        if (n < 2) {
            return new PredictedExpenseResponse(BigDecimal.ZERO, n);
        }
        double sumX = 0;
        double sumY = 0;
        double sumXY = 0;
        double sumX2 = 0;
        for (int i = 0; i < n; i++) {
            double x = i + 1;
            double y = monthlySummaries.get(i).getTotal().doubleValue();
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }
        double denominator = n * sumX2 - (sumX * sumX);
        double slope = denominator == 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
        double intercept = (sumY - slope * sumX) / n;
        double nextX = n + 1;
        double prediction = slope * nextX + intercept;
        if (prediction < 0) {
            prediction = 0;
        }
        BigDecimal predictedAmount = BigDecimal.valueOf(prediction).setScale(2, RoundingMode.HALF_UP);
        return new PredictedExpenseResponse(predictedAmount, n);
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            throw new ResourceNotFoundException("Authenticated user not found");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}

