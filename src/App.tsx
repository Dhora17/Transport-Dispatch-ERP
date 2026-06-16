import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DispatchList from './pages/DispatchList';
import DispatchForm from './pages/DispatchForm';
import Transporters from './pages/Transporters';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import ExcelUpload from './pages/ExcelUpload';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';

interface AppProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

export const App: React.FC<AppProps> = ({ darkMode, toggleTheme }) => {
  return (
    <Routes>
      {/* Login Page - Unprotected */}
      <Route path="/login" element={<Login />} />

      {/* Main ERP Layout - Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout darkMode={darkMode} toggleTheme={toggleTheme} />
          </ProtectedRoute>
        }
      >
        {/* Index redirects to Dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Modules */}
        <Route path="dashboard" element={<ProtectedRoute module="dashboard"><Dashboard /></ProtectedRoute>} />
        
        {/* Dispatch Management */}
        <Route path="dispatches" element={<ProtectedRoute module="dispatches"><DispatchList /></ProtectedRoute>} />
        <Route 
          path="dispatches/add" 
          element={
            <ProtectedRoute module="dispatches" allowedRoles={['Admin', 'Manager']}>
              <DispatchForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="dispatches/edit/:id" 
          element={
            <ProtectedRoute module="dispatches" allowedRoles={['Admin', 'Manager']}>
              <DispatchForm />
            </ProtectedRoute>
          } 
        />

        {/* Transporters & Customers */}
        <Route path="transporters" element={<ProtectedRoute module="transporters"><Transporters /></ProtectedRoute>} />
        <Route path="customers" element={<ProtectedRoute module="customers"><Customers /></ProtectedRoute>} />

        {/* Reports & Analytics */}
        <Route path="reports" element={<ProtectedRoute module="reports"><Reports /></ProtectedRoute>} />
        <Route path="analytics" element={<ProtectedRoute module="analytics"><Analytics /></ProtectedRoute>} />

        {/* Excel Import */}
        <Route path="upload" element={<ProtectedRoute module="upload"><ExcelUpload /></ProtectedRoute>} />

        {/* User Roles (Admin Only) */}
        <Route 
          path="users" 
          element={
            <ProtectedRoute module="users">
              <UserManagement />
            </ProtectedRoute>
          } 
        />

        {/* Settings */}
        <Route path="settings" element={<ProtectedRoute module="settings"><Settings /></ProtectedRoute>} />
      </Route>

      {/* Wildcard Catch-All redirects to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
