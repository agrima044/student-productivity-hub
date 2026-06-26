import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Sparkles } from 'lucide-react';
import './Auth.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login, loginDemo } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email is invalid';
    if (!password) errs.password = 'Password is required';
    setError(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (res.success) {
        addToast('Welcome back!', 'You have successfully logged in.', 'success');
        navigate('/');
      } else {
        addToast('Login Failed', res.error, 'danger');
      }
    }, 800); // Small simulate load
  };

  const handleDemoClick = () => {
    setLoading(true);
    setTimeout(() => {
      loginDemo();
      setLoading(false);
      addToast('Logged in as Demo', 'Explore all productivity dashboard features!', 'info');
      navigate('/');
    }, 500);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">STUDENT HUB</div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to resume your study plans</p>
        </div>

        <div className="auth-alert-demo">
          <p className="font-semibold" style={{ color: 'var(--color-info)' }}>Recruiter Bypass Mode:</p>
          <p>Click "Explore Demo Account" to log in instantly with preloaded mock statistics and goals.</p>
        </div>

        <form onSubmit={handleSubmit}>
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error.password}
            required
          />

          <Button type="submit" fullWidth loading={loading} className="mt-4">
            Sign In
          </Button>

          <Button 
            type="button" 
            variant="secondary" 
            fullWidth 
            onClick={handleDemoClick}
            className="mt-4"
            icon={Sparkles}
          >
            Explore Demo Account
          </Button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <span className="auth-footer-link" onClick={() => navigate('/register')}>
            Sign Up
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
