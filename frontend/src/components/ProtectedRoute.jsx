import { Navigate } from 'react-router-dom';

// This component wraps any page that needs a login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // If no token, send them to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, show the page
  return children;
};