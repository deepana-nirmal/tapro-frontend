# Developer Quick Reference Guide

## File Locations Quick Lookup

### API Services
- **Authentication**: `src/api/auth.ts`
- **Restaurants**: `src/api/restaurants.ts`
- **Orders**: `src/api/orders.ts`
- **Menu**: `src/api/menu.ts`
- **Tables**: `src/api/tables.ts`
- **Users**: `src/api/users.ts`
- **Subscriptions**: `src/api/subscriptions.ts`
- **Client Setup**: `src/api/client.ts`

### Components
- **Button**: `src/components/common/Button.tsx`
- **Input**: `src/components/common/Input.tsx`
- **Select**: `src/components/common/Select.tsx`
- **Modal**: `src/components/common/Modal.tsx`
- **Card/Badge**: `src/components/common/Card.tsx`
- **Loading/Error**: `src/components/common/Loading.tsx`
- **Navbar**: `src/components/shared/Navbar.tsx`
- **Sidebar**: `src/components/shared/Sidebar.tsx`
- **ProtectedRoute**: `src/components/auth/ProtectedRoute.tsx`

### Pages
- **Login**: `src/pages/auth/LoginPage.tsx`
- **Forgot Password**: `src/pages/auth/ForgotPasswordPage.tsx`
- **Super Admin Dashboard**: `src/pages/superadmin/DashboardPage.tsx`
- **Restaurants**: `src/pages/superadmin/RestaurantsPage.tsx`
- **Owner Dashboard**: `src/pages/owner/DashboardPage.tsx`
- **Manager Dashboard**: `src/pages/manager/DashboardPage.tsx`
- **Kitchen Dashboard**: `src/pages/kitchen/DashboardPage.tsx`
- **Cashier Dashboard**: `src/pages/cashier/DashboardPage.tsx`
- **Customer Landing**: `src/pages/customer/LandingPage.tsx`

### Layouts & Store
- **Dashboard Layout**: `src/layouts/DashboardLayout.tsx`
- **Redux Store**: `src/store/index.ts`
- **Auth Reducer**: `src/store/authSlice.ts`

### Configuration
- **Tailwind Config**: `tailwind.config.js`
- **PostCSS Config**: `postcss.config.js`
- **TypeScript Config**: `tsconfig.json`
- **Environment**: `.env.example`

## Common Tasks

### Add a New Page

1. Create file: `src/pages/role/PageName.tsx`
```typescript
import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../hooks';

const PageName: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <DashboardLayout role={user?.role} title="Page Title">
      {/* Content */}
    </DashboardLayout>
  );
};

export default PageName;
```

2. Add route in `src/App.tsx`:
```typescript
<Route
  path="/path"
  element={
    <ProtectedRoute allowedRoles={['ROLE']}>
      <PageName />
    </ProtectedRoute>
  }
/>
```

3. Add to Sidebar in `src/components/shared/Sidebar.tsx`

### Create a Reusable Component

1. Create file: `src/components/common/ComponentName.tsx`
2. Add to `src/components/common/index.ts` export
3. Use in pages:
```typescript
import { ComponentName } from '@/components/common';
```

### Add API Integration

1. Create method in appropriate `src/api/service.ts` file
2. Import and use:
```typescript
import { serviceApi } from '@/api/service';

const data = await serviceApi.method(params);
```

### Handle Errors

```typescript
try {
  await apiCall();
} catch (error: any) {
  const message = error.response?.data?.message;
  toast.error(message || 'Error occurred');
}
```

### Use Authentication State

```typescript
import { useAuth } from '@/hooks';

const { user, isAuthenticated, token } = useAuth();
```

### Dispatch Redux Actions

```typescript
import { useAppDispatch } from '@/hooks';
import { logout } from '@/store/authSlice';

const dispatch = useAppDispatch();
dispatch(logout());
```

### Form Validation

```typescript
import { isValidEmail, isValidPassword } from '@/utils/helpers';

if (!isValidEmail(email)) {
  setError('Invalid email');
}
```

### Format Data

```typescript
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  getRoleLabel,
  getStatusColor,
} from '@/utils/helpers';

console.log(formatDate(date)); // "Jan 15, 2024"
console.log(formatCurrency(100)); // "$100.00"
```

## Styling Guide

### Using Tailwind Classes

```typescript
<div className="flex items-center justify-between p-4">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
  <button className="btn btn-primary">Action</button>
</div>
```

### Custom Utility Classes

```typescript
// Buttons
<button className="btn btn-primary btn-lg btn-disabled" />
<button className="btn btn-secondary btn-sm" />
<button className="btn btn-danger" />

// Forms
<input className="input input-error" />
<input className="input" />

// Cards
<div className="card"> ... </div>
<div className="card card-hover"> ... </div>

// Badges
<span className="badge badge-primary">Active</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-danger">Error</span>

// Layout
<div className="flex-center"> ... </div>
<div className="grid-responsive"> ... </div>
<div className="absolute-center"> ... </div>
```

## Type Safety

### Define Interface

```typescript
// In src/types/index.ts
export interface MyEntity {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}
```

### Use in Component

```typescript
import { MyEntity } from '@/types';

const MyComponent: React.FC<{ data: MyEntity }> = ({ data }) => {
  return <div>{data.name}</div>;
};
```

## API Request/Response Patterns

### Simple GET
```typescript
const data = await restaurantApi.getById(id);
console.log(data.data); // Actual response
```

### Paginated GET
```typescript
const response = await restaurantApi.getAll(page, size);
console.log(response.data.content); // Array of items
console.log(response.data.totalPages); // Pagination info
```

### POST with Error Handling
```typescript
try {
  const newItem = await restaurantApi.create(formData);
  toast.success('Created successfully');
} catch (error: any) {
  const errors = error.response?.data?.errors;
  if (errors) {
    Object.entries(errors).forEach(([field, messages]: any) => {
      console.log(`${field}: ${messages.join(', ')}`);
    });
  }
}
```

## Testing Components

```typescript
// Use mock data
const mockData: MyEntity[] = [
  { id: '1', name: 'Test', status: 'ACTIVE' }
];

// Use in development
if (process.env.NODE_ENV === 'development') {
  setData(mockData);
}
```

## Debugging

### Console Logging
```typescript
console.log('Current user:', user);
console.log('State:', { loading, error, data });
```

### React DevTools
- Install React DevTools browser extension
- Inspect component props and state
- Track Redux actions

### Network Debugging
- Open DevTools (F12)
- Go to Network tab
- Filter by `xhr` for API calls
- Check request/response headers and body

### Redux DevTools
- Install Redux DevTools extension
- Time-travel debug Redux actions
- View state changes

## Performance Tips

1. **Use React.memo for expensive components**
```typescript
const MyComponent = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});
```

2. **Use useMemo for expensive calculations**
```typescript
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);
```

3. **Lazy load routes**
```typescript
const PageName = React.lazy(() => import('./PageName'));
```

4. **Code splitting**
```typescript
<Suspense fallback={<Loading />}>
  <PageName />
</Suspense>
```

## Environment Variables

```bash
# Available in code as
process.env.REACT_APP_API_URL
process.env.REACT_APP_ENV
process.env.NODE_ENV

# NOT available - will be undefined
process.env.SECRET_API_KEY // Don't put secrets in frontend!
```

## Accessibility Checklist

- [ ] Semantic HTML (button, form, input)
- [ ] ARIA labels for icons
- [ ] Keyboard navigation support
- [ ] Color contrast (4.5:1 for text)
- [ ] Focus indicators visible
- [ ] Form validation messages
- [ ] Alt text for images

## Common Fixes

**"Cannot find module" error**
- Check import path spelling
- Ensure file exists
- Check tsconfig.json paths

**"useContext must be called inside a Provider"**
- Wrap component with Provider
- Check nesting order

**"Infinite re-render loop"**
- Check useEffect dependencies
- Don't create new objects in render
- Check for circular state updates

**"Styling not applied"**
- Clear browser cache
- Check class name spelling
- Verify Tailwind config
- Check CSS specificity

## Resources

- [TypeScript Cheat Sheet](https://www.typescriptlang.org/cheatsheets)
- [React Patterns](https://reactjs.org/docs/thinking-in-react.html)
- [Tailwind Classes](https://tailwindcss.com/docs)
- [Redux Toolkit Docs](https://redux-toolkit.js.org)
- [React Router v6](https://reactrouter.com)

---

**Last Updated**: June 2024  
**Version**: 1.0.0
