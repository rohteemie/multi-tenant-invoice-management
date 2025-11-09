import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, DashboardLayout } from './components/layout';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  InvoiceListPage,
  InvoiceCreatePage,
  InvoiceEditPage,
  InvoiceDetailPage,
  UsersPage,
  UserCreatePage,
  UserDetailPage,
  TenantSettingsPage,
} from './pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="invoices" element={<InvoiceListPage />} />
          <Route path="invoices/create" element={<InvoiceCreatePage />} />
          <Route path="invoices/:id/edit" element={<InvoiceEditPage />} />
          <Route path="invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/create" element={<UserCreatePage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="settings" element={<TenantSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
