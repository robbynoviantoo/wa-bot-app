// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';

const PrivateRoute = ({ children }: { children: React.JSX.Element }) => {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
