import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e) => {
    e.preventDefault();
    // Navigate to student dashboard after login
    navigate('/student-dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Logbook System</h1>
        <p className="login-subtitle">Sign in to your account</p>
        
        <form onSubmit={handleSignIn}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="sign-in-btn">
            Sign In
          </button>
        </form>

        <p className="signup-link">
          Don't have an account? <span className="link-text">Sign up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
