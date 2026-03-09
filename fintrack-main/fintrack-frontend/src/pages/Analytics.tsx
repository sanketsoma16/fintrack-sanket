import { useEffect, useState } from 'react';
import { formatINR } from '../currency';
import { analyticsService, MonthlySummary, CategorySummary, TrendPoint, PredictedExpense } from '../services/analyticsService';
import './Analytics.css';

const now = new Date();
const Analytics = () => {
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [monthly, setMonthly] = useState<MonthlySummary[]>([]);
  const [yearly, setYearly] = useState<any[]>([]);
  const [byCategory, setByCategory] = useState<CategorySummary[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [predicted, setPredicted] = useState<PredictedExpense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [selectedYear, selectedMonth]);

  const loadAnalytics = async () => {
    try {
      const [monthlyData, yearlyData, categoryData, trendsData, predictedData] = await Promise.all([
        analyticsService.getMonthlySummary(),
        analyticsService.getYearlySummary(),
        analyticsService.getCategorySummary(selectedYear, selectedMonth),
        analyticsService.getTrends(),
        analyticsService.getPredictedExpense()
      ]);
      setMonthly(monthlyData);
      setYearly(yearlyData);
      setByCategory(categoryData);
      setTrends(trendsData);
      setPredicted(predictedData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaxAmount = (data: any[]) => {
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.total || 0), 1);
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  const maxMonthly = getMaxAmount(monthly);
  const maxCategory = getMaxAmount(byCategory);

  type PieSegment = {
    color: string;
    start: number;
    end: number;
    categoryName: string;
  };

  const totalCategoryAmount = byCategory.reduce((sum, item) => sum + (item.total || 0), 0);
  const pieSegments: PieSegment[] = [];

  if (totalCategoryAmount > 0) {
    const colors = ['#2563eb', '#16a34a', '#f97316', '#a855f7', '#ef4444', '#14b8a6', '#eab308', '#0ea5e9'];
    let currentAngle = 0;

    byCategory.slice(0, 8).forEach((item, index) => {
      const value = item.total || 0;
      if (value <= 0) return;
      const angle = (value / totalCategoryAmount) * 360;
      const start = currentAngle;
      const end = start + angle;
      currentAngle = end;

      pieSegments.push({
        color: colors[index % colors.length],
        start,
        end,
        categoryName: item.categoryName
      });
    });
  }

  const gradientString =
    pieSegments.length > 0
      ? pieSegments.map(seg => `${seg.color} ${seg.start}deg ${seg.end}deg`).join(', ')
      : '';

  return (
    <div className="analytics-page">
      <h1>Analytics & Insights</h1>

      {predicted && (
        <div className="prediction-card">
          <h2>Next Month Prediction</h2>
          <div className="prediction-content">
            <div className="prediction-amount">{formatINR(predicted.predictedAmount)}</div>
            <p>Based on analysis of {predicted.monthsConsidered} months of data</p>
          </div>
        </div>
      )}

      <div className="analytics-grid">
        <div className="analytics-card">
          <h2>Monthly Summary</h2>
          {monthly.length === 0 ? (
            <p className="empty-state">No data available</p>
          ) : (
            <div className="chart-container">
              {monthly.slice(-6).map((item, idx) => (
                <div key={`${item.year}-${item.month}-${idx}`} className="bar-item">
                  <div className="bar-label">{new Date(item.year, item.month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar"
                      style={{ width: `${(item.total / maxMonthly) * 100}%` }}
                    ></div>
                    <span className="bar-value">{formatINR(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="analytics-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>Expenses by Category</h2>
            <select
              value={`${selectedYear}-${selectedMonth}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-').map(Number);
                setSelectedYear(y);
                setSelectedMonth(m);
              }}
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const y = d.getFullYear();
                const m = d.getMonth() + 1;
                return (
                  <option key={i} value={`${y}-${m}`}>
                    {d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </option>
                );
              })}
            </select>
          </div>
          {byCategory.length === 0 ? (
            <p className="empty-state">No data available</p>
          ) : (
            <div className="category-analytics">
              {pieSegments.length > 0 && (
                <div className="category-pie-section">
                  <div
                    className="pie-chart"
                    style={{ backgroundImage: `conic-gradient(${gradientString})` }}
                  ></div>
                  <div className="pie-legend">
                    {pieSegments.map((seg, index) => (
                      <div key={`${seg.categoryName}-${index}`} className="pie-legend-item">
                        <span
                          className="legend-color"
                          style={{ backgroundColor: seg.color }}
                        ></span>
                        <span className="legend-label">{seg.categoryName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="chart-container">
                {byCategory.slice(0, 8).map(item => (
                  <div key={item.categoryId} className="bar-item">
                    <div className="bar-label">{item.categoryName}</div>
                    <div className="bar-wrapper">
                      <div
                        className="bar category-bar"
                        style={{ width: `${(item.total / maxCategory) * 100}%` }}
                      ></div>
                      <span className="bar-value">{formatINR(item.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="analytics-card">
          <h2>Yearly Summary</h2>
          {yearly.length === 0 ? (
            <p className="empty-state">No data available</p>
          ) : (
            <div className="yearly-list">
              {yearly.map(item => (
                <div key={item.year} className="yearly-item">
                  <span className="year">{item.year}</span>
                  <span className="amount">{formatINR(item.total)}</span>
                  <span className="count">{item.count} expenses</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="analytics-card">
          <h2>Expense Trends</h2>
          {trends.length === 0 ? (
            <p className="empty-state">No data available</p>
          ) : (
            <div className="trends-list">
              {trends.slice(-10).map((item, idx) => (
                <div key={idx} className="trend-item">
                  <span className="date">{new Date(item.date).toLocaleDateString()}</span>
                  <span className="amount">{formatINR(item.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;



