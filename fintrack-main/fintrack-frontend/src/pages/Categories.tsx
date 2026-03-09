import { useEffect, useState } from 'react';
import { categoryService, Category, CategoryRequest } from '../services/categoryService';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CategoryRequest>({ name: '', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await categoryService.create(formData);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category? This cannot be undone.')) return;
    try {
      await categoryService.delete(id);
      loadCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  const defaultCategories = categories.filter(c => !c.userId);
  const userCategories = categories.filter(c => c.userId);

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Categories</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {showForm && (
        <div className="category-form-card">
          <h3>Create New Category</h3>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Groceries"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>
      )}

      <div className="categories-grid">
        <div className="category-section">
          <h2>Default Categories</h2>
          <div className="category-list">
            {defaultCategories.map(cat => (
              <div key={cat.id} className="category-card default">
                <div>
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                </div>
                <span className="badge">System</span>
              </div>
            ))}
          </div>
        </div>

        <div className="category-section">
          <h2>Your Categories</h2>
          {userCategories.length === 0 ? (
            <p className="empty-state">No custom categories yet. Create one above!</p>
          ) : (
            <div className="category-list">
              {userCategories.map(cat => (
                <div key={cat.id} className="category-card">
                  <div>
                    <h3>{cat.name}</h3>
                    <p>{cat.description}</p>
                  </div>
                  <button onClick={() => handleDelete(cat.id)} className="btn-delete-small">Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;



