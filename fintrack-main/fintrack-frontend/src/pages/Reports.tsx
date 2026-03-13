import { useState } from 'react';
import { reportService } from '../services/reportService';
import './Reports.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Reports = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [downloading, setDownloading] = useState<'csv' | 'pdf-monthly' | 'pdf-yearly' | null>(null);

  const handleExport = async (type: 'csv' | 'pdf-monthly' | 'pdf-yearly') => {
    setDownloading(type);
    try {
      if (type === 'csv') {
        await reportService.exportCsv();
      } else if (type === 'pdf-monthly') {
        await reportService.exportMonthlyPdf(selectedYear, selectedMonth);
      } else {
        await reportService.exportYearlyPdf(selectedYear);
      }
    } catch (error) {
      const label = type === 'csv' ? 'CSV' : 'PDF';
      alert(`Failed to export ${label}. Please try again.`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="reports-page">
      <h1>Export Reports</h1>
      <p className="subtitle">Download your expense data in various formats</p>

      <div className="reports-grid">
        <div className="report-card">
          <div className="report-icon">📊</div>
          <h2>CSV Export</h2>
          <p>Download your expenses as a CSV file. Perfect for Excel, Google Sheets, or data analysis.</p>
          <button
            onClick={() => handleExport('csv')}
            disabled={downloading !== null}
            className="btn-primary"
          >
            {downloading === 'csv' ? 'Downloading...' : 'Download CSV'}
          </button>
        </div>

        <div className="report-card">
          <div className="report-icon">📄</div>
          <h2>PDF Export</h2>
          <p>Generate a formatted PDF report for a specific month or a full year. Great for printing or sharing.</p>
          <div className="report-selectors">
            <div className="selector-group">
              <label htmlFor="pdf-month">Month</label>
              <select
                id="pdf-month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {MONTHS.map((name, i) => (
                  <option key={i} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div className="selector-group">
              <label htmlFor="pdf-year">Year</label>
              <input
                id="pdf-year"
                type="number"
                min={2000}
                max={2100}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value) || selectedYear)}
              />
            </div>
          </div>
          <div className="report-actions">
            <button
              onClick={() => handleExport('pdf-monthly')}
              disabled={downloading !== null}
              className="btn-primary"
            >
              {downloading === 'pdf-monthly' ? 'Generating...' : 'Download Monthly PDF'}
            </button>
            <button
              onClick={() => handleExport('pdf-yearly')}
              disabled={downloading !== null}
              className="btn-secondary"
            >
              {downloading === 'pdf-yearly' ? 'Generating...' : 'Download Yearly PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className="info-box">
        <h3>What's included in the reports?</h3>
        <ul>
          <li>All expense records with dates, amounts, and categories</li>
          <li>Payment mode information</li>
          <li>Expense descriptions</li>
          <li>Formatted for easy reading and analysis</li>
        </ul>
      </div>
    </div>
  );
};

export default Reports;



