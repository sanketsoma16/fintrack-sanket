import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatINR } from '../currency';
import { analyticsService, MonthlySummary, CategorySummary, PredictedExpense } from '../services/analyticsService';
import { expenseService, Expense } from '../services/expenseService';
import './Dashboard.css';

const Dashboard = () => {
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [yearlyTotal, setYearlyTotal] = useState(0);
  const [topCategory, setTopCategory] = useState('N/A');
  const [topCategoryTotal, setTopCategoryTotal] = useState(0);
  const [predicted, setPredicted] = useState<PredictedExpense | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [monthly, category, predictedData, expenses] = await Promise.all([
        analyticsService.getMonthlySummary(),
        analyticsService.getCategorySummary(),
        analyticsService.getPredictedExpense(),
        expenseService.getAll()
      ]);

      // Calculate monthly total (current month) - backend returns year and month as numbers
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonthNum = now.getMonth() + 1; // 1-12
      const currentMonthData = monthly.find(m => m.year === currentYear && m.month === currentMonthNum);
      setMonthlyTotal(Number(currentMonthData?.total ?? 0));

      // Calculate yearly total
      const yearly = await analyticsService.getYearlySummary();
      const currentYearData = yearly.find(y => y.year === currentYear);
      setYearlyTotal(Number(currentYearData?.total ?? 0));

      // Top category
      if (category.length > 0) {
        const top = category[0];
        setTopCategory(top.categoryName);
        setTopCategoryTotal(Number(top.total ?? 0));
      }

      setPredicted(predictedData);
      setRecentExpenses(expenses.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/expenses/new" className="btn-primary">+ Add Expense</Link>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Monthly Total</h3>
          <p className="amount">{formatINR(monthlyTotal)}</p>
        </div>
        <div className="summary-card">
          <h3>Yearly Total</h3>
          <p className="amount">{formatINR(yearlyTotal)}</p>
        </div>
        <div className="summary-card">
          <h3>Top Category</h3>
          <p className="amount">{topCategory}</p>
          <p className="sub-amount">{formatINR(topCategoryTotal)}</p>
        </div>
        {predicted && (
          <div className="summary-card predicted">
            <h3>Next Month Prediction</h3>
            <p className="amount">{formatINR(Number(predicted.predictedAmount ?? 0))}</p>
            <p className="sub-text">Based on {predicted.monthsConsidered} months</p>
          </div>
        )}
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <h2>Recent Expenses</h2>
          {recentExpenses.length === 0 ? (
            <p className="empty-state">No expenses yet. <Link to="/expenses/new">Add your first expense</Link></p>
          ) : (
            <div className="expense-list">
              {recentExpenses.map(expense => (
                <div key={expense.id} className="expense-item">
                  <div>
                    <strong>{expense.description || 'No description'}</strong>
                    <span className="category">{expense.categoryName || 'Uncategorized'}</span>
                  </div>
                  <div className="expense-amount">{formatINR(Number(expense.amount))}</div>
                </div>
              ))}
              <Link to="/expenses" className="view-all">View All Expenses →</Link>
            </div>
          )}
        </div>

        <div className="section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/expenses" className="action-card">
              <span className="icon">💰</span>
              <span>Manage Expenses</span>
            </Link>
            <Link to="/categories" className="action-card">
              <span className="icon">📁</span>
              <span>Categories</span>
            </Link>
            <Link to="/analytics" className="action-card">
              <span className="icon">📊</span>
              <span>Analytics</span>
            </Link>
            <Link to="/reports" className="action-card">
              <span className="icon">📄</span>
              <span>Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
