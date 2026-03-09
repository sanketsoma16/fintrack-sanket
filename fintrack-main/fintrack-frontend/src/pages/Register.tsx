import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await authService.register({ name, email, password });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // More detailed error handling
      let errorMessage = 'Registration failed. ';
      
      if (!err.response) {
        // Network error - backend not reachable
        errorMessage += 'Cannot connect to server. Make sure the backend is running on http://localhost:8080';
      } else if (err.response.status === 409) {
        // Conflict - email already exists
        errorMessage = err.response?.data?.message || err.response?.data?.error || 'Email is already registered';
      } else if (err.response.status === 400) {
        // Validation error
        const validationErrors = err.response?.data?.details;
        if (validationErrors) {
          errorMessage = 'Validation failed: ' + Object.values(validationErrors).join(', ');
        } else {
          errorMessage = err.response?.data?.message || err.response?.data?.error || 'Invalid input data';
        }
      } else {
        errorMessage = err.response?.data?.message || 
                      err.response?.data?.error || 
                      err.message || 
                      'An unexpected error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label>Password (min 8 characters)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
