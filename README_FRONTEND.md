# Tapro - QR Code Ordering System Frontend

A modern, production-ready React frontend for the Tapro QR Code Ordering SaaS platform. Built with React 19, TypeScript, Tailwind CSS, Redux Toolkit, and React Router.

## 🚀 Features

### Authentication & Authorization
- Login with JWT tokens
- Forgot Password flow
- Reset Password functionality
- Role-based access control (RBAC)
- Protected routes with role guards

### User Roles
- **SUPER_ADMIN**: Platform management
- **RESTAURANT_OWNER**: Restaurant operations
- **MANAGER**: Staff and operations management
- **KITCHEN_STAFF**: Order preparation
- **CASHIER**: Payment processing
- **CUSTOMER**: QR code ordering

### UI Components
- Responsive design (mobile, tablet, desktop)
- Reusable component library
- Dark mode support ready
- Toast notifications
- Modal dialogs
- Form validation
- Loading states
- Error handling

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- Java backend running on `http://localhost:8080`

## 🔧 Installation

1. **Clone the repository**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env.local
```

4. **Update API base URL** (if needed)
Edit `.env.local`:
```
REACT_APP_API_URL=http://localhost:8080/api
```

## 🚀 Running the Application

### Development Mode
```bash
npm start
```
Opens [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Run with Coverage
```bash
npm test -- --coverage
```

## 📁 Project Structure

```
frontend/
├── public/                          # Static files
├── src/
│   ├── api/                        # API service layer
│   │   ├── client.ts              # Axios client with interceptors
│   │   ├── auth.ts                # Authentication endpoints
│   │   ├── restaurants.ts         # Restaurant management
│   │   ├── orders.ts              # Order management
│   │   ├── menu.ts                # Menu and categories
│   │   ├── tables.ts              # Table management
│   │   ├── users.ts               # User management
│   │   └── subscriptions.ts       # Subscription management
│   │
│   ├── components/                 # React components
│   │   ├── common/                # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── index.ts
│   │   ├── auth/                  # Auth components
│   │   │   └── ProtectedRoute.tsx
│   │   ├── shared/                # Shared layouts
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   └── dashboard/             # Dashboard components
│   │
│   ├── pages/                      # Page components
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   ├── superadmin/
│   │   │   ├── DashboardPage.tsx
│   │   │   └── RestaurantsPage.tsx
│   │   ├── owner/
│   │   │   └── DashboardPage.tsx
│   │   ├── manager/
│   │   │   └── (manager pages)
│   │   ├── kitchen/
│   │   │   └── DashboardPage.tsx
│   │   ├── cashier/
│   │   │   └── DashboardPage.tsx
│   │   └── customer/
│   │       ├── LandingPage.tsx
│   │       └── (customer pages)
│   │
│   ├── layouts/                    # Layout components
│   │   └── DashboardLayout.tsx
│   │
│   ├── store/                      # Redux store
│   │   ├── index.ts               # Store configuration
│   │   └── authSlice.ts           # Auth reducer
│   │
│   ├── hooks/                      # Custom hooks
│   │   └── index.ts
│   │
│   ├── types/                      # TypeScript interfaces
│   │   └── index.ts
│   │
│   ├── utils/                      # Utility functions
│   │   └── helpers.ts
│   │
│   ├── styles/                     # Global styles
│   │   └── globals.css
│   │
│   ├── App.tsx                     # Main app component
│   ├── index.tsx                   # React entry point
│   └── index.css                   # Global styles
│
├── public/
│   └── index.html
│
├── .env.example                    # Environment variables template
├── tailwind.config.js              # Tailwind CSS config
├── postcss.config.js               # PostCSS config
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
└── README.md
```

## 🎨 Tailwind CSS Utilities

### Custom Utility Classes
- `.btn` - Button base styles
- `.btn-primary`, `.btn-secondary`, `.btn-danger` - Button variants
- `.input` - Input field styles
- `.card` - Card container
- `.badge` - Badge component
- `.text-muted`, `.text-error`, `.text-success` - Text utilities
- `.flex-center` - Flex container centered
- `.grid-responsive` - Responsive grid

## 🔐 Authentication Flow

1. **Login**
   - User enters email and password
   - Backend returns JWT token
   - Token stored in localStorage
   - User redirected to dashboard

2. **Protected Routes**
   - ProtectedRoute component checks authentication
   - Redirects unauthenticated users to login
   - Validates user role for role-based routes

3. **Token Refresh**
   - Axios interceptor automatically includes token
   - On 401 response, token is cleared
   - User redirected to login

4. **Logout**
   - Token removed from localStorage
   - User redirected to login

## 📡 API Integration

### API Client Setup
```typescript
// Automatic JWT token injection
// Automatic 401 error handling
// Base URL from environment variable
```

### Making API Calls
```typescript
import { restaurantApi } from '@/api/restaurants';

const restaurants = await restaurantApi.getAll(page, size);
```

## 🎯 Role-Based Access Control

### Super Admin Routes
- `/dashboard` - Dashboard
- `/restaurants` - Manage restaurants
- `/users` - Manage users
- `/subscriptions` - Manage plans
- `/reports` - View reports
- `/settings` - Platform settings

### Restaurant Owner Routes
- `/dashboard` - Dashboard
- `/restaurant` - Restaurant profile
- `/staff` - Staff management
- `/tables` - Table management
- `/menu` - Menu management
- `/orders` - Order management
- `/reports` - Sales reports

### Manager Routes
- `/dashboard` - Dashboard
- `/menu` - Menu management
- `/orders` - Order management
- `/tables` - Table management

### Kitchen Staff Routes
- `/kitchen/orders` - View orders

### Cashier Routes
- `/cashier/billing` - Billing
- `/cashier/orders` - Orders

### Customer Routes
- `/` - Landing page
- `/menu` - Browse menu
- `/orders` - Order history
- `/profile` - Profile management

## 🧪 Testing Components

Example login credentials for testing:
```
Email: admin@example.com
Password: password123
```

## 📦 Dependencies

### Core
- **react** (19.x) - UI framework
- **react-dom** (19.x) - DOM rendering
- **react-router-dom** (6.x) - Client-side routing
- **typescript** - Type safety

### State Management
- **@reduxjs/toolkit** - Redux state management
- **react-redux** - React-Redux bindings

### HTTP & API
- **axios** - HTTP client

### UI & Styling
- **tailwindcss** - Utility-first CSS
- **lucide-react** - Icon library
- **react-hot-toast** - Toast notifications

### Development
- **react-scripts** - Build tools
- **@types/react** - Type definitions

## 🔧 Configuration

### Tailwind Config
Located in `tailwind.config.js`:
- Extended color palette
- Custom components
- Responsive breakpoints

### TypeScript Config
Located in `tsconfig.json`:
- Path aliases for imports
- Strict mode enabled

## 🚀 Deployment

### Build Production Bundle
```bash
npm run build
```

### Environment Variables for Production
Create `.env.production.local`:
```
REACT_APP_API_URL=https://api.production.com/api
```

### Deploy to Services
- **Vercel**: `vercel deploy`
- **Netlify**: Connect GitHub repo
- **GitHub Pages**: `npm run build` + gh-pages
- **Docker**: Create Dockerfile and build image

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📝 Available Scripts

- `npm start` - Start development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## 📞 Support

For issues and questions, please reach out to the development team.

## 📄 License

Proprietary - Tapro QR Code Ordering System

---

## Next Steps

1. **Setup Backend Connection**
   - Ensure Spring Boot backend is running
   - Update `REACT_APP_API_URL` in `.env.local`

2. **Complete Role-Specific Pages**
   - Implement remaining pages for each role
   - Add data tables and forms
   - Implement real-time updates with WebSockets

3. **Testing**
   - Write unit tests for components
   - Write integration tests for API calls
   - Write E2E tests for critical flows

4. **Performance Optimization**
   - Implement code splitting
   - Optimize bundle size
   - Implement lazy loading
   - Cache API responses

5. **Security**
   - Implement CSRF protection
   - Add rate limiting
   - Sanitize user inputs
   - Implement secure session management

6. **Analytics & Monitoring**
   - Setup Google Analytics
   - Implement error tracking (Sentry)
   - Setup performance monitoring

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Redux Toolkit Guide](https://redux-toolkit.js.org)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com)
