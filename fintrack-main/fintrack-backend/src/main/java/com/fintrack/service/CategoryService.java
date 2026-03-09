package com.fintrack.service;

import com.fintrack.dto.CategoryRequest;
import com.fintrack.dto.CategoryResponse;
import com.fintrack.exceptions.OperationNotAllowedException;
import com.fintrack.exceptions.ResourceAlreadyExistsException;
import com.fintrack.exceptions.ResourceNotFoundException;
import com.fintrack.model.Category;
import com.fintrack.model.User;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.UserRepository;
import com.fintrack.utils.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryService(CategoryRepository categoryRepository,
                           UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public List<CategoryResponse> getCategoriesForCurrentUser() {
        User user = getCurrentUser();
        List<Category> categories = new ArrayList<>();
        categories.addAll(categoryRepository.findByUserIsNull());
        categories.addAll(categoryRepository.findByUser(user));
        return categories.stream()
                .sorted(Comparator.comparing(Category::getName))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        User user = getCurrentUser();
        boolean existsDefault = categoryRepository.existsByNameAndUserIsNull(request.getName());
        if (existsDefault || categoryRepository.existsByNameAndUser(request.getName(), user)) {
            throw new ResourceAlreadyExistsException("Category name already exists");
        }
        Category category = new Category(
                null,
                request.getName(),
                request.getDescription(),
                user
        );
        return toResponse(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (category.getUser() == null) {
            throw new OperationNotAllowedException("Default categories cannot be deleted");
        }
        User user = getCurrentUser();
        if (!category.getUser().getId().equals(user.getId())) {
            throw new OperationNotAllowedException("Cannot delete another user's category");
        }
        categoryRepository.delete(category);
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            throw new ResourceNotFoundException("Authenticated user not found");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getUser() == null
        );
    }
}

