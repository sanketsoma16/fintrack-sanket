package com.fintrack.config;

import com.fintrack.model.Category;
import com.fintrack.repository.CategoryRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class CategoryInitializer {

    private static final List<String> DEFAULT_CATEGORIES = List.of(
            "Food",
            "Transportation",
            "Utilities",
            "Entertainment",
            "Healthcare",
            "Education",
            "Shopping",
            "Travel"
    );

    @Bean
    public ApplicationRunner categorySeedRunner(CategoryRepository categoryRepository) {
        return args -> DEFAULT_CATEGORIES.stream()
                .filter(name -> !categoryRepository.existsByNameAndUserIsNull(name))
                .map(name -> new Category(null, name, name + " expenses", null))
                .forEach(categoryRepository::save);
    }
}

