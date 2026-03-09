package com.fintrack.service;

import com.fintrack.exceptions.ResourceNotFoundException;
import com.fintrack.model.Expense;
import com.fintrack.model.User;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.ExpenseRepository;
import com.fintrack.repository.UserRepository;
import com.fintrack.utils.SecurityUtils;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfTemplate;
import com.itextpdf.awt.PdfGraphics2D;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.Year;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.Locale;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;
import java.awt.Graphics2D;
import java.awt.Color;
import java.awt.geom.Arc2D;

@Service
public class ReportService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public ReportService(ExpenseRepository expenseRepository,
                         CategoryRepository categoryRepository,
                         UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public ByteArrayInputStream generateCsvReport() {
        User user = getCurrentUser();
        List<Expense> expenses = expenseRepository.findAllByUser(user);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);
        writer.println("Date,Category,Amount,Payment Mode,Description");
        for (Expense expense : expenses) {
            writer.printf("%s,%s,%s,%s,%s%n",
                    expense.getDate().format(DATE_FORMATTER),
                    resolveCategory(expense.getCategoryId()),
                    expense.getAmount(),
                    expense.getPaymentMode(),
                    sanitize(expense.getDescription()));
        }
        writer.flush();
        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generatePdfReport() {
        User user = getCurrentUser();
        List<Expense> expenses = expenseRepository.findAllByUser(user);
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
            document.add(new Paragraph("Expense Report", titleFont));
            document.add(new Paragraph(" "));

            // Monthly category-wise pie chart (current month)
            LocalDate now = LocalDate.now();
            YearMonth currentMonth = YearMonth.from(now);
            Map<String, BigDecimal> monthlyCategoryTotals = expenses.stream()
                    .filter(e -> YearMonth.from(e.getDate()).equals(currentMonth))
                    .collect(Collectors.groupingBy(
                            e -> resolveCategory(e.getCategoryId()),
                            Collectors.mapping(Expense::getAmount,
                                    Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));
            addCategoryPieChart(document, writer, monthlyCategoryTotals, "Current Month - Expenses by Category");

            // Yearly category-wise pie chart (current year)
            Year currentYear = Year.of(now.getYear());
            Map<String, BigDecimal> yearlyCategoryTotals = expenses.stream()
                    .filter(e -> Year.of(e.getDate().getYear()).equals(currentYear))
                    .collect(Collectors.groupingBy(
                            e -> resolveCategory(e.getCategoryId()),
                            Collectors.mapping(Expense::getAmount,
                                    Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));
            addCategoryPieChart(document, writer, yearlyCategoryTotals, "Current Year - Expenses by Category");

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Detailed Expenses", titleFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            addHeader(table, "Date");
            addHeader(table, "Category");
            addHeader(table, "Amount");
            addHeader(table, "Payment Mode");
            addHeader(table, "Description");
            for (Expense expense : expenses) {
                table.addCell(expense.getDate().format(DATE_FORMATTER));
                table.addCell(resolveCategory(expense.getCategoryId()));
                table.addCell(formatAmount(expense.getAmount()));
                table.addCell(expense.getPaymentMode());
                table.addCell(expense.getDescription() == null ? "" : expense.getDescription());
            }
            document.add(table);
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to create PDF report", e);
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    /**
     * Generates a PDF report for a specific month and year.
     * Returns filtered expenses; if none found, PDF still generated with message.
     */
    public ByteArrayInputStream generateMonthlyPdf(int year, int month) {
        User user = getCurrentUser();
        List<Expense> expenses = expenseRepository.findAllByUserAndYearAndMonth(user, year, month);
        String monthName = Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        String reportTitle = "Expense Report - " + monthName + " " + year;

        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
            document.add(new Paragraph(reportTitle, titleFont));
            document.add(new Paragraph(" "));

            if (expenses.isEmpty()) {
                document.add(new Paragraph("No expenses found for this month.", titleFont));
                document.close();
                return new ByteArrayInputStream(out.toByteArray());
            }

            // Category pie chart for the selected month
            Map<String, BigDecimal> categoryTotals = expenses.stream()
                    .collect(Collectors.groupingBy(
                            e -> resolveCategory(e.getCategoryId()),
                            Collectors.mapping(Expense::getAmount,
                                    Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));
            addCategoryPieChart(document, writer, categoryTotals, "Expenses by Category");

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Detailed Expenses", titleFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            addHeader(table, "Date");
            addHeader(table, "Category");
            addHeader(table, "Amount");
            addHeader(table, "Payment Mode");
            addHeader(table, "Description");
            for (Expense expense : expenses) {
                table.addCell(expense.getDate().format(DATE_FORMATTER));
                table.addCell(resolveCategory(expense.getCategoryId()));
                table.addCell(formatAmount(expense.getAmount()));
                table.addCell(expense.getPaymentMode());
                table.addCell(expense.getDescription() == null ? "" : expense.getDescription());
            }
            document.add(table);
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to create monthly PDF report", e);
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addCategoryPieChart(Document document,
                                     PdfWriter writer,
                                     Map<String, BigDecimal> categoryTotals,
                                     String title) throws DocumentException {
        if (categoryTotals == null || categoryTotals.isEmpty()) {
            return;
        }

        // Keep insertion order stable for pie slices and legend
        Map<String, BigDecimal> orderedTotals = new LinkedHashMap<>();
        categoryTotals.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> orderedTotals.put(entry.getKey(), entry.getValue()));

        BigDecimal grandTotal = orderedTotals.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (grandTotal.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD);
        document.add(new Paragraph(" "));
        document.add(new Paragraph(title, sectionFont));
        document.add(new Paragraph(" "));

        int size = 260;
        PdfContentByte cb = writer.getDirectContent();
        PdfTemplate template = cb.createTemplate(size, size);
        Graphics2D g2 = new PdfGraphics2D(template, size, size);

        g2.setColor(Color.WHITE);
        g2.fillRect(0, 0, size, size);

        Color[] colors = new Color[] {
                new Color(37, 99, 235),   // blue
                new Color(22, 163, 74),   // green
                new Color(249, 115, 22),  // orange
                new Color(168, 85, 247),  // purple
                new Color(239, 68, 68),   // red
                new Color(14, 165, 233),  // sky
                new Color(234, 179, 8),   // yellow
                new Color(20, 184, 166)   // teal
        };

        java.util.List<Color> usedColors = new ArrayList<>();

        double startAngle = 0.0;
        int index = 0;
        for (Map.Entry<String, BigDecimal> entry : orderedTotals.entrySet()) {
            double value = entry.getValue().doubleValue();
            if (value <= 0) {
                continue;
            }
            double angle = (value / grandTotal.doubleValue()) * 360.0;
            Color sliceColor = colors[index % colors.length];
            g2.setColor(sliceColor);
            Arc2D.Double arc = new Arc2D.Double(0, 0, size, size, startAngle, angle, Arc2D.PIE);
            g2.fill(arc);
            startAngle += angle;
            usedColors.add(sliceColor);
            index++;
        }

        g2.dispose();

        Image chartImage = Image.getInstance(template);
        chartImage.setAlignment(Image.ALIGN_CENTER);
        document.add(chartImage);

        // Legend with color and category name
        PdfPTable legendTable = new PdfPTable(2);
        legendTable.setSpacingBefore(10f);

        int colorIndex = 0;
        for (Map.Entry<String, BigDecimal> entry : orderedTotals.entrySet()) {
            BigDecimal value = entry.getValue();
            if (value.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            Color legendColor = usedColors.get(colorIndex++);
            PdfPCell colorCell = new PdfPCell();
            colorCell.setBackgroundColor(new BaseColor(
                    legendColor.getRed(),
                    legendColor.getGreen(),
                    legendColor.getBlue()
            ));
            colorCell.setFixedHeight(10f);
            colorCell.setMinimumHeight(10f);
            legendTable.addCell(colorCell);

            double percentage = value.multiply(BigDecimal.valueOf(100))
                    .divide(grandTotal, 1, RoundingMode.HALF_UP)
                    .doubleValue();

            PdfPCell labelCell = new PdfPCell(new Paragraph(
                    String.format("%s - %s (%.1f%%)", entry.getKey(), formatAmount(value), percentage)
            ));
            legendTable.addCell(labelCell);
        }

        document.add(legendTable);
    }

    private void addHeader(PdfPTable table, String text) {
        PdfPCell header = new PdfPCell();
        header.setPhrase(new Paragraph(text));
        table.addCell(header);
    }

    private String formatAmount(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP).toString();
    }

    private String resolveCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .map(category -> category.getName())
                .orElse("Unknown");
    }

    private String sanitize(String value) {
        if (value == null) {
            return "";
        }
        return value.replace(",", " ");
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

