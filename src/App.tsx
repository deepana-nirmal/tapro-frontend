import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './hooks';
import { restoreSession } from './store/authSlice';
import { setDarkMode } from './store/uiSlice';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import {
  ChangePasswordPage,
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
} from './pages/auth';
import { AcceptInvitationPage, AdminInvitationsPage } from './pages/invitations';
import { LandingPage, CheckoutPage, RestaurantMenuPage, TrackOrderPage } from './pages/public';
import {
  InvitationManagementPage,
  PlatformReportsPage,
  PlatformSettingsPage,
  RestaurantsManagementPage,
  SubscriptionManagementPage,
  SuperAdminDashboardPage,
  SuperAdminRestaurantDetailPage,
  SuperAdminUsersManagementPage,
} from './pages/admin';
import {
  CategoryManagementPage,
  MenuItemsManagementPage,
  OwnerDashboardPage,
  OwnerOrdersPage,
  OwnerReportsPage,
  RestaurantProfilePage,
  StaffManagementPage,
  TableManagementPage,
} from './pages/owner';
import {
  BillingPage,
  CashierDashboardPage,
  KitchenDashboardPage,
  ManagerDashboardPage,
  ManagerMenuPage,
  ManagerOrdersPage,
  ManagerTablesPage,
  PaymentsPage,
} from './pages/staff';
import { CustomerDashboardPage, CustomerOrdersPage, CustomerProfilePage } from './pages/customer';

const StaffDashboardPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  return user?.backendRole === 'CASHIER' ? <CashierDashboardPage /> : <ManagerDashboardPage />;
};

const AdminInvitationsRoute = () => {
  const user = useAppSelector((state) => state.auth.user);
  return user?.backendRole === 'SUPER_ADMIN'
    ? <Navigate to="/super-admin/invitations" replace />
    : <AdminInvitationsPage />;
};

const AppRoutes = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    dispatch(setDarkMode(darkMode));
  }, [darkMode, dispatch]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route path="/accept-invite" element={<AcceptInvitationPage />} />
      <Route path="/invite/accept" element={<AcceptInvitationPage />} />
      <Route path="/menu/:restaurantId/table/:tableId" element={<RestaurantMenuPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders/track/:orderId" element={<TrackOrderPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/super-admin" element={<SuperAdminDashboardPage />} />
            <Route path="/super-admin/restaurants" element={<RestaurantsManagementPage />} />
            <Route path="/super-admin/restaurants/:restaurantId" element={<SuperAdminRestaurantDetailPage />} />
            <Route path="/super-admin/users" element={<SuperAdminUsersManagementPage />} />
            <Route path="/super-admin/invitations" element={<InvitationManagementPage />} />
            <Route path="/super-admin/subscriptions" element={<SubscriptionManagementPage />} />
            <Route path="/super-admin/reports" element={<PlatformReportsPage />} />
            <Route path="/super-admin/settings" element={<PlatformSettingsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER']} allowedBackendRoles={['SUPER_ADMIN', 'ADMIN']} />}>
            <Route path="/admin/dashboard" element={<ManagerDashboardPage />} />
            <Route path="/admin/invitations" element={<AdminInvitationsRoute />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['RESTAURANT_OWNER']} />}>
            <Route path="/owner" element={<OwnerDashboardPage />} />
            <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
            <Route path="/owner/profile" element={<RestaurantProfilePage />} />
            <Route path="/owner/staff" element={<StaffManagementPage />} />
            <Route path="/owner/tables" element={<TableManagementPage />} />
            <Route path="/owner/categories" element={<CategoryManagementPage />} />
            <Route path="/owner/menu" element={<MenuItemsManagementPage />} />
            <Route path="/owner/orders" element={<OwnerOrdersPage />} />
            <Route path="/owner/reports" element={<OwnerReportsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'CASHIER']} allowedBackendRoles={['ADMIN', 'STAFF', 'CASHIER']} />}>
            <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
            <Route path="/manager" element={<ManagerDashboardPage />} />
            <Route path="/manager/menu" element={<ManagerMenuPage />} />
            <Route path="/manager/orders" element={<ManagerOrdersPage />} />
            <Route path="/manager/tables" element={<ManagerTablesPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['KITCHEN_STAFF']} />}>
            <Route path="/kitchen" element={<KitchenDashboardPage />} />
            <Route path="/kitchen/dashboard" element={<KitchenDashboardPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['CASHIER']} />}>
            <Route path="/cashier" element={<CashierDashboardPage />} />
            <Route path="/cashier/billing" element={<BillingPage />} />
            <Route path="/cashier/payments" element={<PaymentsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
            <Route path="/account" element={<CustomerDashboardPage />} />
            <Route path="/account/orders" element={<CustomerOrdersPage />} />
            <Route path="/account/profile" element={<CustomerProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <AppRoutes />
      <Toaster position="top-right" />
    </BrowserRouter>
  </Provider>
);

export default App;
