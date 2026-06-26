import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import './Auth.css';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email is invalid';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setError(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      const res = register(name, email, password);
      setLoading(false);
      if (res.success) {
        addToast('Registration Successful! 🎉', 'Welcome to your Student Productivity Hub.', 'success');
        navigate('/');
      } else {
        addToast('Sign Up Failed', res.error, 'danger');
      }
    }, 800);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">STUDENT HUB</div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Get started with your personal productivity suite</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            type="text"
            placeholder="e.g. Alex Mercer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error.name}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. alex@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error.email}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error.password}
            required
          />

          <Button type="submit" fullWidth loading={loading} className="mt-4">
            Sign Up
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <span className="auth-footer-link" onClick={() => navigate('/login')}>
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
