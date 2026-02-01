import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Login from './pages/Login'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import BankAccounts from './pages/BankAccounts'
import Transactions from './pages/Transactions'
import Deposit from './pages/Deposit'
import Withdraw from './pages/Withdraw'
import Settings from './pages/Settings'
import GameLobby from './pages/GameLobby'
import Sports from './pages/Sports'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminTransactions from './pages/admin/Transactions'
import AdminTransactionHistory from './pages/admin/TransactionHistory'
import AdminAgencies from './pages/admin/Agencies'
import PrivateRoute from './components/PrivateRoute'
import AdminPrivateRoute from './components/AdminPrivateRoute'
import './App.css'

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#d0ad4a',
          borderRadius: 4,
          colorBgBase: '#001529',
        },
      }}
    >
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* User routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/bank-accounts"
            element={
              <PrivateRoute>
                <BankAccounts />
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            }
          />
          <Route
            path="/deposit"
            element={
              <PrivateRoute>
                <Deposit />
              </PrivateRoute>
            }
          />
          <Route
            path="/withdraw"
            element={
              <PrivateRoute>
                <Withdraw />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/games"
            element={
              <PrivateRoute>
                <GameLobby />
              </PrivateRoute>
            }
          />
          <Route
            path="/sports"
            element={
              <Sports />
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminPrivateRoute>
                <AdminDashboard />
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminPrivateRoute>
                <AdminUsers />
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <AdminPrivateRoute>
                <AdminTransactions />
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin/transaction-history"
            element={
              <AdminPrivateRoute>
                <AdminTransactionHistory />
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin/agencies"
            element={
              <AdminPrivateRoute>
                <AdminAgencies />
              </AdminPrivateRoute>
            }
          />

          {/* Redirect all other routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  )
}

export default App