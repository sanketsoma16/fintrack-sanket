package com.fintrack.controller;

import com.fintrack.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv() {
        ByteArrayInputStream stream = reportService.generateCsvReport();
        byte[] bytes = stream.readAllBytes();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=expenses.csv")
                .body(bytes);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf() {
        ByteArrayInputStream stream = reportService.generatePdfReport();
        byte[] bytes = stream.readAllBytes();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=expenses.pdf")
                .body(bytes);
    }

    /**
     * Monthly PDF report filtered by year and month.
     * File name: expenses-YYYY-MM.pdf
     */
    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportMonthlyPdf(
            @RequestParam int year,
            @RequestParam int month) {
        ByteArrayInputStream stream = reportService.generateMonthlyPdf(year, month);
        byte[] bytes = stream.readAllBytes();
        String filename = String.format("expenses-%d-%02d.pdf", year, month);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .body(bytes);
    }
}

