package com.fintrack.repository;

import com.fintrack.model.Expense;
import com.fintrack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findAllByUser(User user);
    Optional<Expense> findByIdAndUser(Long id, User user);

    List<Expense> findAllByUserAndDateBetween(User user, LocalDate start, LocalDate end);

    /**
     * Fetches expenses for a specific month and year for the given user.
     */
    @Query("SELECT e FROM Expense e WHERE e.user = :user AND YEAR(e.date) = :year AND MONTH(e.date) = :month ORDER BY e.date")
    List<Expense> findAllByUserAndYearAndMonth(@Param("user") User user, @Param("year") int year, @Param("month") int month);
}

