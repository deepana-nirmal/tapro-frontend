# API Integration Guide

## Overview

The frontend uses a service-based architecture to communicate with the Spring Boot backend. All API calls are organized in the `/src/api` directory.

## Authentication

### JWT Token Flow

1. **Login Request**
```typescript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "RESTAURANT_OWNER"
  }
}
```

2. **Token Storage**
- Token is automatically stored in localStorage as `authToken`
- Token is automatically sent in Authorization header for all requests

3. **Token Validation**
- Axios interceptor validates token on every request
- If token is invalid (401), user is redirected to login

### Forgot Password Flow

1. **Request Password Reset**
```typescript
POST /api/auth/forgot-password
{
  "email": "user@example.com"
}
```

2. **Reset Password with Token**
```typescript
POST /api/auth/reset-password
{
  "token": "reset-token-from-email",
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### Change Password

```typescript
POST /api/auth/change-password
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

## API Service Examples

### Restaurants API

```typescript
import { restaurantApi } from '@/api/restaurants';

// Get all restaurants (paginated)
const response = await restaurantApi.getAll(page, size);
// Returns: { content: Restaurant[], totalElements, totalPages, ... }

// Get single restaurant
const restaurant = await restaurantApi.getById(id);

// Create restaurant
const newRestaurant = await restaurantApi.create({
  name: "Restaurant Name",
  email: "rest@example.com",
  phone: "+1234567890",
  address: "123 Main St",
  city: "New York",
  state: "NY",
  zipCode: "10001",
  country: "USA",
  cuisineType: "Italian"
});

// Update restaurant
const updated = await restaurantApi.update(id, {
  name: "Updated Name",
  // ... other fields
});

// Delete restaurant
await restaurantApi.delete(id);

// Suspend restaurant
await restaurantApi.suspend(id);

// Activate restaurant
await restaurantApi.activate(id);

// Upload logo
await restaurantApi.uploadLogo(id, logoFile);
```

### Orders API

```typescript
import { orderApi } from '@/api/orders';

// Get all orders for restaurant
const response = await orderApi.getAll(restaurantId, page, size);

// Get single order
const order = await orderApi.getById(id);

// Create new order
const newOrder = await orderApi.create({
  tableId: "table-123",
  items: [
    {
      menuItemId: "item-1",
      quantity: 2,
      specialInstructions: "No onions"
    }
  ],
  specialNotes: "Allergy notice"
});

// Update order status
await orderApi.updateStatus(id, "PREPARING");

// Accept order
await orderApi.accept(id);

// Reject order
await orderApi.reject(id);

// Mark as preparing
await orderApi.markPreparing(id);

// Mark as ready
await orderApi.markReady(id);

// Mark as completed
await orderApi.markCompleted(id);

// Cancel order
await orderApi.cancel(id);

// Get orders by table
const tableOrders = await orderApi.getByTable(tableId);

// Get customer's order history
const response = await orderApi.getByCustomer(customerId, page, size);
```

### Menu API

```typescript
import { categoryApi, menuItemApi } from '@/api/menu';

// Categories
const categories = await categoryApi.getByRestaurant(restaurantId);
const category = await categoryApi.getById(id);
const newCategory = await categoryApi.create({ name: "Beverages", ... });
await categoryApi.update(id, { name: "Updated Name" });
await categoryApi.delete(id);
await categoryApi.uploadImage(id, imageFile);

// Menu Items
const items = await menuItemApi.getByRestaurant(restaurantId, page, size);
const items = await menuItemApi.getByCategory(categoryId);
const item = await menuItemApi.getById(id);
const newItem = await menuItemApi.create({
  categoryId: "cat-123",
  name: "Burger",
  description: "Delicious burger",
  price: 9.99,
  available: true
});
await menuItemApi.update(id, { price: 10.99 });
await menuItemApi.delete(id);
await menuItemApi.uploadImage(id, imageFile);
await menuItemApi.setAvailability(id, true);
```

### Tables API

```typescript
import { tableApi } from '@/api/tables';

// Get all tables for restaurant
const tables = await tableApi.getByRestaurant(restaurantId);

// Get single table
const table = await tableApi.getById(id);

// Create table
const newTable = await tableApi.create({
  restaurantId: "rest-123",
  tableNumber: 1,
  capacity: 4
});

// Update table
await tableApi.update(id, { capacity: 6 });

// Delete table
await tableApi.delete(id);

// Generate QR code
const result = await tableApi.generateQRCode(id);
// Returns: { qrCode: "data:image/png;base64,..." }

// Download QR code
const blob = await tableApi.downloadQRCode(id);
```

### Users & Staff API

```typescript
import { userApi, staffApi } from '@/api/users';

// Users
const users = await userApi.getAll(page, size);
const user = await userApi.getById(id);
await userApi.updateProfile(id, { name: "New Name" });
await userApi.suspendUser(id);
await userApi.activateUser(id);
await userApi.deleteUser(id);

// Invite Owner
const result = await userApi.inviteOwner({
  email: "owner@example.com",
  name: "Owner Name",
  role: "RESTAURANT_OWNER"
});

// Staff
const staff = await staffApi.getByRestaurant(restaurantId);
const staffMember = await staffApi.getById(id);

// Invite staff member
const result = await staffApi.invite({
  email: "staff@example.com",
  name: "Staff Name",
  role: "KITCHEN_STAFF",
  restaurantId: "rest-123"
});

// Resend invitation
await staffApi.resendInvitation("staff@example.com");

// Cancel invitation
await staffApi.cancelInvitation("staff@example.com");

// Disable staff member
await staffApi.disable(id);

// Enable staff member
await staffApi.enable(id);
```

### Subscriptions API

```typescript
import { subscriptionApi } from '@/api/subscriptions';

// Get all plans
const plans = await subscriptionApi.getPlans();

// Get single plan
const plan = await subscriptionApi.getPlanById(id);

// Create plan (Super Admin only)
const newPlan = await subscriptionApi.createPlan({
  name: "Premium Plan",
  description: "For large restaurants",
  price: 99.99,
  billingCycle: "MONTHLY",
  maxRestaurants: 5,
  maxUsers: 50,
  features: ["Advanced analytics", "Priority support"]
});

// Update plan
await subscriptionApi.updatePlan(id, { price: 109.99 });

// Delete plan
await subscriptionApi.deletePlan(id);

// Assign plan to restaurant
const subscription = await subscriptionApi.assignPlan(restaurantId, planId);

// Get restaurant's subscription
const subscription = await subscriptionApi.getRestaurantSubscription(restaurantId);

// Get all active subscriptions
const response = await subscriptionApi.getActiveSubscriptions(page, size);

// Cancel subscription
await subscriptionApi.cancelSubscription(subscriptionId);
```

### Payments API

```typescript
import { paymentApi } from '@/api/payments';

// Get payments for order
const payments = await paymentApi.getByOrder(orderId);

// Get payments for restaurant
const response = await paymentApi.getByRestaurant(restaurantId, page, size);

// Create payment
const payment = await paymentApi.create({
  orderId: "order-123",
  amount: 45.99,
  method: "CARD"
});

// Mark as paid
await paymentApi.markPaid(paymentId);

// Mark as failed
await paymentApi.markFailed(paymentId);

// Get daily sales
const sales = await paymentApi.getDailySales(restaurantId, "2024-01-15");
// Returns: { totalAmount: 1234.56, count: 15 }
```

## Error Handling

All API calls return promises that can throw errors. Handle them appropriately:

```typescript
try {
  const result = await restaurantApi.getAll();
  // Success
} catch (error: any) {
  const statusCode = error.response?.status;
  const errorMessage = error.response?.data?.message;
  
  if (statusCode === 401) {
    // Unauthorized - token invalid
  } else if (statusCode === 403) {
    // Forbidden - no permission
  } else if (statusCode === 404) {
    // Not found
  } else if (statusCode === 422) {
    // Validation error
    const validationErrors = error.response?.data?.errors;
  } else {
    // Generic error
  }
}
```

## Response Format

All API responses follow a consistent format:

```typescript
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Optional success message",
  "errors": null
}
```

For paginated endpoints:

```typescript
{
  "success": true,
  "data": {
    "content": [ /* array of items */ ],
    "totalElements": 100,
    "totalPages": 5,
    "currentPage": 0,
    "pageSize": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

## Usage in Components

### Example: Fetch Data in useEffect

```typescript
import { useEffect, useState } from 'react';
import { restaurantApi } from '@/api/restaurants';
import { Restaurant } from '@/types';

const MyComponent = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await restaurantApi.getAll(0, 10);
        setRestaurants(response.data.content);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {restaurants.map(rest => (
        <div key={rest.id}>{rest.name}</div>
      ))}
    </div>
  );
};
```

### Example: Form Submission

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const restaurant = await restaurantApi.create(formData);
    toast.success('Restaurant created successfully');
    // Redirect or refresh list
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to create restaurant');
  }
};
```

## Testing API Calls

Use mock data for development:

```typescript
const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Pizza Palace",
    email: "pizza@example.com",
    // ... other fields
  }
];

// Use in component for testing
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    setRestaurants(mockRestaurants);
  }
}, []);
```

## Best Practices

1. **Always handle errors** - Don't let API errors crash the app
2. **Show loading states** - Provide user feedback during requests
3. **Use TypeScript** - Leverage type safety for API responses
4. **Cache when possible** - Reduce unnecessary API calls
5. **Validate input** - Validate data before sending to API
6. **Use appropriate HTTP methods** - GET, POST, PUT, PATCH, DELETE
7. **Implement request debouncing** - For search and filter requests
8. **Add request timeout** - Prevent hanging requests

---

For more information, see the main README and SETUP_GUIDE.
