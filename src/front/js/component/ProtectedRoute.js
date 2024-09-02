import { Route, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('token') !== null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


// En tu componente de rutas principal
<Route 
  path="/create-mystery-box" 
  element={
    <ProtectedRoute>
      <CreateMysteryBox />
    </ProtectedRoute>
  } 
/>