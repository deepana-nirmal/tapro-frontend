# Frontend Setup & Implementation Guide

## 1. Initial Setup

### Step 1: Clone or Navigate to Frontend Directory
```bash
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File
```bash
cp .env.example .env.local
```

### Step 4: Configure Backend URL
Edit `.env.local`:
```
REACT_APP_API_URL=http://localhost:8080/api
```

### Step 5: Start Development Server
```bash
npm start
```

The application will open at `http://localhost:3000`

## 2. Project Structure Overview

### `/src/api` - API Service Layer
Contains all API calls organized by entity:
- `client.ts` - Axios configuration with interceptors
- `auth.ts` - Authentication endpoints
- `restaurants.ts` - Restaurant management
- `orders.ts` - Order management
- `menu.ts` - Menu and categories
- `tables.ts` - Table management
- `users.ts` - User management
- `subscriptions.ts` - Subscription management

**Usage Example:**
```typescript
import { restaurantApi } from '@/api/restaurants';

const restaurants = await restaurantApi.getAll(0, 10);
```

### `/src/components` - React Components
- **common/** - Reusable UI components (Button, Input, Modal, etc.)
- **auth/** - Authentication components (ProtectedRoute)
- **shared/** - Shared components (Navbar, Sidebar)
- **dashboard/** - Dashboard-specific components

**Usage Example:**
```typescript
import { Button, Input, Modal, Card, Badge } from '@/components/common';
```

### `/src/pages` - Page Components
Organized by role:
- `auth/` - Login, Forgot Password
- `superadmin/` - Super Admin pages
- `owner/` - Restaurant Owner pages
- `manager/` - Manager pages
- `kitchen/` - Kitchen Staff pages
- `cashier/` - Cashier pages
- `customer/` - Customer pages

### `/src/store` - Redux Store
- `index.ts` - Store configuration
- `authSlice.ts` - Authentication state management

**Usage Example:**
```typescript
import { useAppDispatch, useAppSelector, useAuth } from '@/hooks';

const dispatch = useAppDispatch();
const { user, isAuthenticated } = useAuth();
```

### `/src/types` - TypeScript Interfaces
All type definitions for API responses and UI components.

### `/src/utils` - Utility Functions
Helper functions for:
- Date/time formatting
- Currency formatting
- Text manipulation
- Email validation
- Password validation

### `/src/hooks` - Custom Hooks
- `useAuth()` - Get authenticated user info
- `useAppDispatch()` - Type-safe dispatch
- `useAppSelector()` - Type-safe selector
- `useLocalStorage()` - LocalStorage management

### `/src/layouts` - Layout Components
- `DashboardLayout` - Main dashboard layout with navbar and sidebar

### `/src/styles` - Global Styles
- `globals.css` - Tailwind CSS directives and custom utilities

## 3. Adding New Pages

### Example: Create Orders Page for Owner

1. **Create the page component:**
```bash
touch src/pages/owner/OrdersPage.tsx
```

2. **Implement the page:**
```typescript
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../hooks';
import { orderApi } from '../../api/orders';
import { Order } from '../../types';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderApi.getAll(user?.restaurantId!, 0, 20);
      setOrders(response.data.content);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role={user?.role} title="Orders">
      {/* Your content here */}
    </DashboardLayout>
  );
};

export default OrdersPage;
```

3. **Add the route in App.tsx:**
```typescript
<Route
  path="/owner/orders"
  element={
    <ProtectedRoute allowedRoles={['RESTAURANT_OWNER']}>
      <OrdersPage />
    </ProtectedRoute>
  }
/>
```

4. **Update Sidebar navigation in `/src/components/shared/Sidebar.tsx`**

## 4. Creating Reusable Components

### Example: Create a Table Component

```typescript
// src/components/common/Table.tsx
import React from 'react';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
}

const Table = <T extends { id: string }>({
  columns,
  data,
  onRowClick,
  loading = false,
}: TableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="px-6 py-3 text-left">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className="border-b hover:bg-gray-50"
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-6 py-4">
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
```

## 5. Form Validation Example

```typescript
import { isValidEmail, isValidPassword } from '@/utils/helpers';

const validateForm = (formData: any) => {
  const errors: Record<string, string> = {};

  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Invalid email format';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(formData.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
  }

  return errors;
};
```

## 6. API Error Handling

```typescript
try {
  const response = await restaurantApi.getAll();
  // Handle success
} catch (error: any) {
  if (error.response?.status === 401) {
    // Unauthorized - handled by interceptor
  } else if (error.response?.status === 403) {
    // Forbidden
    toast.error('You do not have permission for this action');
  } else if (error.response?.status === 404) {
    // Not found
    toast.error('Resource not found');
  } else {
    // General error
    toast.error(error.response?.data?.message || 'An error occurred');
  }
}
```

## 7. Using Redux State

```typescript
import { useAppDispatch, useAppSelector } from '@/hooks';
import { login, logout } from '@/store/authSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleLogin = async () => {
    dispatch(login({ email: 'user@example.com', password: 'password' }));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    // Your JSX
  );
};
```

## 8. Building & Deployment

### Build Production Bundle
```bash
npm run build
```

This creates an optimized build in the `build/` directory.

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
1. Push code to GitHub
2. Connect repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `build`

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine
RUN npm install -g serve
COPY --from=0 /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build"]
```

## 9. Environment Variables

### Development
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
```

### Production
```
REACT_APP_API_URL=https://api.production.com/api
REACT_APP_ENV=production
```

## 10. Common Issues & Solutions

### CORS Errors
- Ensure backend has CORS enabled
- Check API_BASE_URL in .env.local
- Verify backend is running

### Login Issues
- Check email/password format
- Verify backend API is accessible
- Check network tab in browser DevTools

### Routes Not Working
- Verify route exists in App.tsx
- Check user role has permission
- Verify ProtectedRoute wrapper

### Styling Issues
- Check Tailwind config is correct
- Verify globals.css is imported
- Clear browser cache

## 11. Performance Optimization Tips

1. **Code Splitting**
   - Use React.lazy() for large components
   - Dynamic imports for routes

2. **Bundle Size**
   - Remove unused dependencies
   - Use tree-shaking
   - Minify production build

3. **Caching**
   - Set appropriate cache headers
   - Implement SWR (stale-while-revalidate)
   - Cache API responses

4. **Rendering**
   - Use useMemo and useCallback
   - Implement virtualization for long lists
   - Lazy load images

## 12. Next Steps

1. **Complete remaining pages** for each role
2. **Implement real-time updates** using WebSockets
3. **Add comprehensive testing** with Jest and React Testing Library
4. **Setup CI/CD pipeline** with GitHub Actions
5. **Implement analytics** with Google Analytics
6. **Add monitoring** with Sentry
7. **Performance optimization** and auditing

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
