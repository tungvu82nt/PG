import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated } from '../store/auth.store'

const PrivateRoute: React.FC = () => {
  const authenticated = isAuthenticated()
  
  if (!authenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <Outlet />
}

export default PrivateRoute