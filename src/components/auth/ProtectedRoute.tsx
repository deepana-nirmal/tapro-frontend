import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import { defaultPathByRole } from '../../utils/auth';
import { BackendRole, UserRole } from '../../types';

export const ProtectedRoute = ({
  allowedRoles,
  allowedBackendRoles,
}: {
  allowedRoles?: UserRole[];
  allowedBackendRoles?: BackendRole[];
}) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={defaultPathByRole[user.role]} replace />;
  }

  if (allowedBackendRoles && !allowedBackendRoles.includes(user.backendRole)) {
    return <Navigate to={defaultPathByRole[user.role]} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
