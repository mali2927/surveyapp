import React, { useState, useEffect } from 'react';
import './Css/Login.css'; // Import the CSS file
import { useNavigate, Navigate } from 'react-router-dom';
import config from '../config'; // Import the config file

const Login = () => {
  const navigate = useNavigate(); // Correctly using useNavigate hook
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // For sign-up
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between login and sign-up
  const [loading, setLoading] = useState(false); // Loading state
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');

    if (token && email) {
      const handleSession = async () => {
        try {
          const response = await fetch(`${config.baseURL}/handleSession`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, email }),
          });

          if (response.ok) {
            const data = await response.json();
            setIsAuthenticated(data.isAuthenticated);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error during session handling:', error);
          setIsAuthenticated(false);
        }
      };

      handleSession();
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Both fields are required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${config.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      setLoading(false);

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', email); // Save token to local storage
        console.log(data.token); // Print token to console for debugging
        alert('Login successful!');
        navigate('/DragAndDrop'); // Redirect to the dashboard or other appropriate route
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setLoading(false);
      setError('An error occurred');
      console.error('Error:', error);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${config.baseURL}/register`, { // Assuming there's an endpoint for sign-up
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      setLoading(false);

      if (response.ok) {
        alert('Sign-up successful!');
        navigate('/DragAndDrop'); // Redirect to a welcome or other appropriate route
      } else {
        setError(data.message || 'Sign-up failed');
      }
    } catch (error) {
      setLoading(false);
      setError('An error occurred');
      console.error('Error:', error);
    }
  };

  const handleCheckboxChange = () => {
    setShowPassword(!showPassword);
  };

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show a loading state while checking authentication
  }

  if (isAuthenticated) {
    return <Navigate to="/DragAndDrop" />;
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="title">{isSignUp ? 'Sign Up' : 'Login'}</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="email"
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type={showPassword ? 'text' : 'password'}
          className="input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isSignUp && (
          <input
            type={showPassword ? 'text' : 'password'}
            className="input"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}
        <div className="password-container">
          <label className="show-password-label">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={handleCheckboxChange}
              className="show-password-checkbox"
            />
            Show Password
          </label>
        </div>
        <button
          className="button"
          onClick={isSignUp ? handleSignUp : handleLogin}
          disabled={loading} // Disable button when loading
        >
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
        </button>
        {loading && <div className="loading-bar"></div>} {/* Display loading bar */}
        <p className="toggle-auth">
          {isSignUp ? 'Already have an account? ' : 'Don\'t have an account? '}
          <button
            className="toggle-auth-button"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
