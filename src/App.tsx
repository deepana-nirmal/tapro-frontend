import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster, ErrorBoundary } from './components/ui';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './hooks';
import { restoreSession } from './store/authSlice';
import { setDarkMode } from './store/uiSlice';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import { LoadingBlock } from './components/ui';

const lazyPage = <T extends Record<string, any>, K extends keyof T>(loader: () => Promise<T>, exportName: K) =>
  lazy(() => loader().then((module) => ({ default: module[exportName] as any })));

const LandingPage = lazyPage(() => import('./pages/LandingPage'), 'LandingPage');
const PrivacyPolicyPage = lazyPage(() => import('./pages/legal'), 'PrivacyPolicyPage');
const TermsPage = lazyPage(() => import('./pages/legal'), 'TermsPage');
const LoginPage = lazyPage(() => import('./pages/auth'), 'LoginPage');
const RegisterPage = lazyPage(() => import('./pages/auth'), 'RegisterPage');
const ForgotPasswordPage = lazyPage(() => import('./pages/auth'), 'ForgotPasswordPage');
const ResetPasswordPage = lazyPage(() => import('./pages/auth'), 'ResetPasswordPage');
const ChangePasswordPage = lazyPage(() => import('./pages/auth'), 'ChangePasswordPage');
const AcceptInvitationPage = lazyPage(() => import('./pages/invitations'), 'AcceptInvitationPage');
const AdminInvitationsPage = lazyPage(() => import('./pages/invitations'), 'AdminInvitationsPage');
const CheckoutPage = lazyPage(() => import('./pages/customerOrdering'), 'CheckoutPage');
const RestaurantMenuPage = lazyPage(() => import('./pages/customerOrdering'), 'RestaurantMenuPage');
const TrackOrderPage = lazyPage(() => import('./pages/customerOrdering'), 'TrackOrderPage');
const SuperAdminDashboardPage = lazyPage(() => import('./pages/admin'), 'SuperAdminDashboardPage');
const RestaurantsManagementPage = lazyPage(() => import('./pages/admin'), 'RestaurantsManagementPage');
const SuperAdminRestaurantDetailPage = lazyPage(() => import('./pages/admin'), 'SuperAdminRestaurantDetailPage');
const SuperAdminUsersManagementPage = lazyPage(() => import('./pages/admin'), 'SuperAdminUsersManagementPage');
const InvitationManagementPage = lazyPage(() => import('./pages/admin'), 'InvitationManagementPage');
const SubscriptionManagementPage = lazyPage(() => import('./pages/admin'), 'SubscriptionManagementPage');
const PlatformReportsPage = lazyPage(() => import('./pages/admin'), 'PlatformReportsPage');
const PlatformSettingsPage = lazyPage(() => import('./pages/admin'), 'PlatformSettingsPage');
const OwnerDashboardPage = lazyPage(() => import('./pages/owner'), 'OwnerDashboardPage');
const RestaurantProfilePage = lazyPage(() => import('./pages/owner'), 'RestaurantProfilePage');
const StaffManagementPage = lazyPage(() => import('./pages/owner'), 'StaffManagementPage');
const TableManagementPage = lazyPage(() => import('./pages/owner'), 'TableManagementPage');
const CategoryManagementPage = lazyPage(() => import('./pages/owner'), 'CategoryManagementPage');
const MenuItemsManagementPage = lazyPage(() => import('./pages/owner'), 'MenuItemsManagementPage');
const OwnerOrdersPage = lazyPage(() => import('./pages/owner'), 'OwnerOrdersPage');
const OwnerReportsPage = lazyPage(() => import('./pages/owner'), 'OwnerReportsPage');
const ManagerDashboardPage = lazyPage(() => import('./pages/staff'), 'ManagerDashboardPage');
const CashierDashboardPage = lazyPage(() => import('./pages/staff'), 'CashierDashboardPage');
const ManagerMenuPage = lazyPage(() => import('./pages/staff'), 'ManagerMenuPage');
const ManagerOrdersPage = lazyPage(() => import('./pages/staff'), 'ManagerOrdersPage');
const ManagerTablesPage = lazyPage(() => import('./pages/staff'), 'ManagerTablesPage');
const KitchenDashboardPage = lazyPage(() => import('./pages/staff'), 'KitchenDashboardPage');
const BillingPage = lazyPage(() => import('./pages/staff'), 'BillingPage');
const PaymentsPage = lazyPage(() => import('./pages/staff'), 'PaymentsPage');
const CustomerDashboardPage = lazyPage(() => import('./pages/customer'), 'CustomerDashboardPage');
const CustomerOrdersPage = lazyPage(() => import('./pages/customer'), 'CustomerOrdersPage');
const CustomerProfilePage = lazyPage(() => import('./pages/customer'), 'CustomerProfilePage');

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
    <Suspense fallback={<div className="p-6"><LoadingBlock label="Loading page..." /></div>}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route path="/accept-invite" element={<AcceptInvitationPage />} />
      <Route path="/invite/accept" element={<AcceptInvitationPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
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
            <Route path="/owner/settings" element={<RestaurantProfilePage />} />
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
    </Suspense>
  );
};

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <ErrorBoundary><AppRoutes /></ErrorBoundary>
      <Toaster
        position="top-right"
        containerStyle={{ top: 'max(12px, env(safe-area-inset-top))', left: 12, right: 12 }}
        toastOptions={{ style: { maxWidth: 'min(420px, calc(100vw - 24px))', overflowWrap: 'anywhere' } }}
      />
    </BrowserRouter>
  </Provider>
);

export default App;
