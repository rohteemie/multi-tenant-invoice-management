import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, DashboardLayout } from './components/layout';
import { InstallPWA } from './components/pwa';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  DashboardPage,
  InvoiceListPage,
  InvoiceCreatePage,
  InvoiceEditPage,
  InvoiceDetailPage,
  UsersPage,
  UserCreatePage,
  UserDetailPage,
  TenantSettingsPage,
  ReportsPage,
  CustomersPage,
  ProductsPage,
} from './pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
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
          <Route path="reports" element={<ReportsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="products" element={<ProductsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <InstallPWA />
    </Router>
  );
}

export default App;
