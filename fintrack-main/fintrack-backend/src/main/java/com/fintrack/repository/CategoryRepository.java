package com.fintrack.repository;

import com.fintrack.model.Category;
import com.fintrack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserIsNull();
    List<Category> findByUser(User user);
    boolean existsByNameAndUser(String name, User user);
    boolean existsByNameAndUserIsNull(String name);
}

