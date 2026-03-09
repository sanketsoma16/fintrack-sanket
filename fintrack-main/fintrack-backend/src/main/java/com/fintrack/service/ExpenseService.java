package com.fintrack.service;

import com.fintrack.dto.ExpenseRequest;
import com.fintrack.dto.ExpenseResponse;
import com.fintrack.exceptions.ResourceNotFoundException;
import com.fintrack.model.Expense;
import com.fintrack.model.User;
import com.fintrack.model.Category;
import com.fintrack.repository.ExpenseRepository;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.UserRepository;
import com.fintrack.utils.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ExpenseService(ExpenseRepository expenseRepository,
                          CategoryRepository categoryRepository,
                          UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public ExpenseResponse createExpense(ExpenseRequest request) {
        User user = getCurrentUser();
        Expense expense = new Expense(
                null,
                user,
                request.getCategoryId(),
                request.getAmount(),
                request.getDescription(),
                request.getDate(),
                request.getPaymentMode()
        );
        Expense saved = expenseRepository.save(expense);
        return toResponse(saved);
    }

    public List<ExpenseResponse> getExpenses() {
        User user = getCurrentUser();
        return expenseRepository.findAllByUser(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ExpenseResponse getExpenseById(Long id) {
        Expense expense = getExpenseForCurrentUser(id);
        return toResponse(expense);
    }

    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Expense expense = getExpenseForCurrentUser(id);
        expense.setCategoryId(request.getCategoryId());
        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setDate(request.getDate());
        expense.setPaymentMode(request.getPaymentMode());
        return toResponse(expenseRepository.save(expense));
    }

    public void deleteExpense(Long id) {
        Expense expense = getExpenseForCurrentUser(id);
        expenseRepository.delete(expense);
    }

    private Expense getExpenseForCurrentUser(Long id) {
        User user = getCurrentUser();
        return expenseRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            throw new ResourceNotFoundException("Authenticated user not found");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ExpenseResponse toResponse(Expense expense) {
        String categoryName = resolveCategoryName(expense.getCategoryId());
        return new ExpenseResponse(
                expense.getId(),
                expense.getUser().getId(),
                expense.getCategoryId(),
                categoryName,
                expense.getAmount(),
                expense.getDescription(),
                expense.getDate(),
                expense.getPaymentMode()
        );
    }

    private String resolveCategoryName(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .map(Category::getName)
                .orElse("Unknown");
    }
}

