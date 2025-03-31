import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { logoutFromFirebase } from './firebase';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import FileManager from './components/FileManager';
import UserProfile from './components/UserProfile';
import Navbar from './components/layout/Navbar';

// Set axios defaults
axios.defaults.baseURL = 'http://localhost:8002/api';
axios.defaults.withCredentials = true;

// Add a request interceptor to add the auth token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
axios.interceptors.response.use(
  response => response,
  error => {
    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication error:', error.response.data);

      // Only clear auth if we're not on login/register pages
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        console.log('Clearing authentication due to auth error');
        localStorage.removeItem('token');
        // Force redirect to login will happen on next render due to ProtectedRoute
      }
    }
    return Promise.reject(error);
  }
);

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      try {
        const response = await axios.get('/api/profile/', {
          headers: { Authorization: `Token ${token}` }
        });

        setUser(response.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth error:', err);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        setError('Session expired. Please log in again.');
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (userData) => {
    try {
      setIsAuthenticated(true);
      setUser(userData);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message || 'Login failed');
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Try Firebase logout
      try {
        await logoutFromFirebase();
      } catch (firebaseErr) {
        console.error('Firebase logout error:', firebaseErr.message);
        // Continue with backend logout even if Firebase logout fails
      }

      // Logout from backend
      await axios.post('/logout/');

      // Clear local storage and reset state
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err.response?.data || err.message);
      // Still remove token and log out even if server logout fails
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      setError('Logout encountered an error, but you have been signed out.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {isAuthenticated && <Navbar user={user} logout={logout} />}
        <div className="container">
          {error && (
            <div style={{
              padding: '10px',
              margin: '10px 0',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Login login={login} />
            } />
            <Route path="/register" element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard user={user} />
              </ProtectedRoute>
            } />
            <Route path="/files" element={
              <ProtectedRoute>
                <FileManager />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
