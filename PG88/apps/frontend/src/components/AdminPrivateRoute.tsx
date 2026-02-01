import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated, isAdminUser } from '../store/auth.store'

const AdminPrivateRoute: React.FC = () => {
  const authenticated = isAuthenticated()
  const isAdmin = isAdminUser()
  
  if (!authenticated) {
    return <Navigate to="/admin/login" replace />
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }
  
  return <Outlet />
}

export default AdminPrivateRoute