import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';


const PrivateRoute = ({ children, adminRoute = false }) => {
  // const token = localStorage.getItem("token");
  

  // if (!token) {
  //   return <Navigate to="/login" replace />;
  // }
  

  const isAuthenticated = localStorage.getItem("isAuthenticated");
  // const isAdmin = localStorage.getItem("isAdmin");
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  // console.log('private route', isAuthenticated, isAdmin);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // console.log('admin route', adminRoute, isAdmin, adminRoute && !isAdmin);
  if ((adminRoute && !isAdmin )|| (isAdmin && !adminRoute)) {
    // console.log('admin route sf', adminRoute, isAdmin);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
