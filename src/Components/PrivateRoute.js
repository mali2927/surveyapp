import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import config from '../config'; // Import the config file

const PrivateRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initial state is null to show loading state
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

  useEffect(() => {
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

    if (token && email) {
      handleSession();
    } else {
      setIsAuthenticated(false);
    }
  }, [token, email]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show a loading state while checking authentication
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
