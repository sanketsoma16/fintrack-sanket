import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { formatINR } from '../currency';
import { expenseService, Expense, ExpenseRequest } from '../services/expenseService';
import { categoryService, Category } from '../services/categoryService';
import './Expenses.css';

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expensesData, categoriesData] = await Promise.all([
        expenseService.getAll(),
        categoryService.getAll()
      ]);
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseService.delete(id);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (error) {
      alert('Failed to delete expense');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading expenses...</div>;
  }

  return (
    <div className="expenses-page">
      <div className="page-header">
        <h1>Expenses</h1>
        <Link to="/expenses/new" className="btn-primary">+ Add Expense</Link>
      </div>

      {expenses.length === 0 ? (
        <div className="empty-state">
          <p>No expenses yet. <Link to="/expenses/new">Add your first expense</Link></p>
        </div>
      ) : (
        <div className="expenses-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <tr key={expense.id}>
                  <td>{formatDate(expense.date)}</td>
                  <td>{expense.description || '-'}</td>
                  <td>{expense.categoryName || 'Uncategorized'}</td>
                  <td className="amount">{formatINR(Number(expense.amount))}</td>
                  <td>{expense.paymentMode}</td>
                  <td>
                    <Link to={`/expenses/${expense.id}/edit`} className="btn-edit">Edit</Link>
                    <button onClick={() => handleDelete(expense.id)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export const ExpenseForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ExpenseRequest>({
    categoryId: 0,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
    if (id) {
      loadExpense();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
      if (data.length > 0 && !id) {
        setFormData(prev => ({ ...prev, categoryId: data[0].id }));
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadExpense = async () => {
    try {
      const expense = await expenseService.getById(Number(id));
      setFormData({
        categoryId: expense.categoryId,
        amount: expense.amount,
        description: expense.description,
        date: expense.date.split('T')[0],
        paymentMode: expense.paymentMode
      });
    } catch (error) {
      setError('Failed to load expense');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (id) {
        await expenseService.update(Number(id), formData);
      } else {
        await expenseService.create(formData);
      }
      navigate('/expenses');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-form-page">
      <div className="page-header">
        <h1>{id ? 'Edit Expense' : 'Add Expense'}</h1>
        <Link to="/expenses" className="btn-secondary">← Back</Link>
      </div>

      <div className="form-container">
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
              required
            >
              <option value={0}>Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
            />
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Payment Mode *</label>
            <select
              value={formData.paymentMode}
              onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
              required
            >
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : id ? 'Update' : 'Create'}
            </button>
            <Link to="/expenses" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Expenses;



