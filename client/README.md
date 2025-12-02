# Frontend Architecture Documentation

## Overview

This document outlines the folder structure and architectural decisions for our multi-portal frontend application. Our application serves four distinct user roles: Admin, Salesperson, Customer, and Doctor. Each role has its own dedicated portal with specific functionality.

---

## Table of Contents

- [Folder Structure](#folder-structure)
- [Core Concepts](#core-concepts)
- [Portal Organization](#portal-organization)
- [Module Structure](#module-structure)
- [Routing Architecture](#routing-architecture)
- [Shared Resources](#shared-resources)
- [Naming Conventions](#naming-conventions)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [Environment Configuration](#environment-configuration)

---

## Folder Structure

```
project-root/
├── .env.development           # Development environment variables
├── .env.staging              # Staging environment variables
├── .env.production           # Production environment variables
├── .env.example              # Template for environment variables
├── .gitignore                # Git ignore file (includes .env files)
├── src/
    ├── portals/                    # User role-specific applications
    │   ├── admin/
    │   │   ├── modules/
    │   │   │   ├── profile/
    │   │   │   │   ├── components/
    │   │   │   │   ├── hooks/
    │   │   │   │   └── index.js
    │   │   │   ├── user-management/
    │   │   │   └── analytics/
    │   │   └── layouts/
    │   │
    │   ├── salesperson/
    │   │   ├── modules/
    │   │   │   ├── profile/
    │   │   │   ├── sales-dashboard/
    │   │   │   └── customer-list/
    │   │   └── layouts/
    │   │
    │   ├── customer/
    │   │   ├── modules/
    │   │   │   ├── profile/
    │   │   │   ├── medicine-description/
    │   │   │   └── order-history/
    │   │   └── layouts/
    │   │
    │   └── doctor/
    │       ├── modules/
    │       │   ├── profile/
    │       │   ├── patient-records/
    │       │   └── prescriptions/
    │       └── layouts/
    │
    ├── shared/                     # Shared resources across portals
    │   ├── components/            # Reusable UI components
    │   │   ├── Button/
    │   │   ├── Modal/
    │   │   ├── Form/
    │   │   └── DataTable/
    │   ├── hooks/                 # Custom React hooks
    │   ├── utils/                 # Helper functions
    │   ├── constants/             # Application constants
    │
    ├── core/                       # Core application logic
    │   ├── api/                   # API client setup
    │   ├── routing/               # Route configurations
    │   │   ├── Routes.jsx        # Main routing component
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── routes/
    │   │   │   ├── adminRoutes.js
    │   │   │   ├── salespersonRoutes.js
    │   │   │   ├── customerRoutes.js
    │   │   │   └── doctorRoutes.js
    │   │   └── index.js
    │   └── store/                 # State management (Zustand)
    │
    └── assets/                     # Static assets
        ├── images/
        ├── icons/
        └── styles/
```

---

## Core Concepts

### Portals

**Portals** represent distinct user interfaces for each actor/role in our system. Each portal is a self-contained application section with its own:

- Navigation structure
- Business logic
- UI/UX patterns
- Access controls

**Available Portals:**

- **Admin**: System administration, user management, analytics
- **Salesperson**: Sales operations, customer management, orders
- **Customer**: Product browsing, ordering, order tracking
- **Doctor**: Patient records, prescriptions, medical information

### Modules

**Modules** are feature-based groupings within each portal. Each module represents a specific page or feature set (e.g., Profile, Dashboard, User Management).

### Components

**Components** are reusable UI elements specific to a module or shared across the application.

---

## Portal Organization

### Portal Structure

Each portal follows this structure:

```
portals/[portal-name]/
├── modules/              # Feature modules for this portal
├── layouts/              # Portal-specific layouts (Header, Sidebar, Footer)
└── README.md            # Portal-specific documentation (optional)
```

### When to Create a New Portal

Create a new portal when:

- A new user role is introduced
- The role requires a completely different UI/UX
- Access permissions differ significantly from existing portals

---

## Module Structure

Each module within a portal follows this consistent structure:

```
modules/[module-name]/
├── components/           # UI components specific to this module
│   ├── ComponentName.jsx
│   └── ComponentName.module.css (or .scss)
├── hooks/               # Custom hooks for this module
│   └── useModuleData.js
├── utils/               # Module-specific utilities
│   └── helpers.js
├── constants/           # Module-specific constants
│   └── config.js
└── [Module][Module-Name].jsx            # Main module entry point
```

### Module Guidelines

1. **[Module][Module-Name].jsx**: Main entry point that exports the module's primary component
2. **components/**: Contains all UI components used within this module
3. **hooks/**: Custom React hooks for data fetching, state management, etc.
4. **utils/**: Helper functions specific to this module
5. **constants/**: Module-specific constants and configuration

### Example Module: Profile

```javascript
// portals/customer/modules/profile/index.js
import React from 'react';
import ProfileHeader from './components/ProfileHeader';
import ProfileForm from './components/ProfileForm';
import { useProfile } from './hooks/useProfile';

const Profile = () => {
  const { profile, updateProfile, isLoading } = useProfile();

  return (
    <div>
      <ProfileHeader user={profile} />
      <ProfileForm
        data={profile}
        onSubmit={updateProfile}
        loading={isLoading}
      />
    </div>
  );
};

export default Profile;
```

---

## Routing Architecture

### Overview

Our routing system is designed to handle multiple portals with role-based access control. Each portal has its own set of routes, and users are directed to the appropriate portal based on their role after authentication.

### Routing Structure

```
core/routing/
├── Routes.jsx                 # Main routing component
├── ProtectedRoute.jsx        # Route guard component
├── routes/                    # Portal-specific route configs
│   ├── adminRoutes.js
│   ├── salespersonRoutes.js
│   ├── customerRoutes.js
│   └── doctorRoutes.js
└── index.js                   # Exports for easy import
```

### Main Routes Component

The `Routes.jsx` file is the central routing configuration that connects all portals:

```javascript
// core/routing/Routes.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../auth/useAuth';

// Portal Layouts
import AdminLayout from '@portals/admin/layouts/AdminLayout';
import SalespersonLayout from '@portals/salesperson/layouts/SalespersonLayout';
import CustomerLayout from '@portals/customer/layouts/CustomerLayout';
import DoctorLayout from '@portals/doctor/layouts/DoctorLayout';

// Route Configurations
import { adminRoutes } from './routes/adminRoutes';
import { salespersonRoutes } from './routes/salespersonRoutes';
import { customerRoutes } from './routes/customerRoutes';
import { doctorRoutes } from './routes/doctorRoutes';

// Auth Pages
import Login from '@shared/pages/Login';
import NotFound from '@shared/pages/NotFound';
import Unauthorized from '@shared/pages/Unauthorized';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Root redirect based on user role */}
        <Route
          path="/"
          element={<Navigate to={user ? `/${user.role}` : '/login'} replace />}
        />

        {/* Admin Portal Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {adminRoutes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* Salesperson Portal Routes */}
        <Route
          path="/salesperson/*"
          element={
            <ProtectedRoute allowedRoles={['salesperson']}>
              <SalespersonLayout />
            </ProtectedRoute>
          }
        >
          {salespersonRoutes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* Customer Portal Routes */}
        <Route
          path="/customer/*"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          {customerRoutes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* Doctor Portal Routes */}
        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorLayout />
            </ProtectedRoute>
          }
        >
          {doctorRoutes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
```

### Protected Route Component

The `ProtectedRoute.jsx` component handles authentication and authorization:

```javascript
// core/routing/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <div>Loading...</div>; // Replace with your loading component
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is allowed to access this route
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children if provided, otherwise render nested routes
  return children ? children : <Outlet />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
```

### Portal Route Configurations

Each portal has its own route configuration file:

```javascript
// core/routing/routes/adminRoutes.js
import React, { lazy } from 'react';

// Lazy load components for code splitting
const Dashboard = lazy(() => import('@portals/admin/modules/dashboard'));
const Profile = lazy(() => import('@portals/admin/modules/profile'));
const UserManagement = lazy(
  () => import('@portals/admin/modules/user-management')
);
const Analytics = lazy(() => import('@portals/admin/modules/analytics'));
const Settings = lazy(() => import('@portals/admin/modules/settings'));

export const adminRoutes = [
  {
    path: '',
    element: <Dashboard />,
    name: 'Dashboard',
  },
  {
    path: 'profile',
    element: <Profile />,
    name: 'Profile',
  },
  {
    path: 'users',
    element: <UserManagement />,
    name: 'User Management',
  },
  {
    path: 'analytics',
    element: <Analytics />,
    name: 'Analytics',
  },
  {
    path: 'settings',
    element: <Settings />,
    name: 'Settings',
  },
];
```

```javascript
// core/routing/routes/customerRoutes.js
import React, { lazy } from 'react';

const Dashboard = lazy(() => import('@portals/customer/modules/dashboard'));
const Profile = lazy(() => import('@portals/customer/modules/profile'));
const MedicineDescription = lazy(
  () => import('@portals/customer/modules/medicine-description')
);
const OrderHistory = lazy(
  () => import('@portals/customer/modules/order-history')
);
const Cart = lazy(() => import('@portals/customer/modules/cart'));

export const customerRoutes = [
  {
    path: '',
    element: <Dashboard />,
    name: 'Dashboard',
  },
  {
    path: 'profile',
    element: <Profile />,
    name: 'Profile',
  },
  {
    path: 'medicines/:id',
    element: <MedicineDescription />,
    name: 'Medicine Details',
  },
  {
    path: 'orders',
    element: <OrderHistory />,
    name: 'Order History',
  },
  {
    path: 'cart',
    element: <Cart />,
    name: 'Shopping Cart',
  },
];
```

```javascript
// core/routing/routes/salespersonRoutes.js
import React, { lazy } from 'react';

const Dashboard = lazy(
  () => import('@portals/salesperson/modules/sales-dashboard')
);
const Profile = lazy(() => import('@portals/salesperson/modules/profile'));
const CustomerList = lazy(
  () => import('@portals/salesperson/modules/customer-list')
);
const Orders = lazy(() => import('@portals/salesperson/modules/orders'));
const Reports = lazy(() => import('@portals/salesperson/modules/reports'));

export const salespersonRoutes = [
  {
    path: '',
    element: <Dashboard />,
    name: 'Sales Dashboard',
  },
  {
    path: 'profile',
    element: <Profile />,
    name: 'Profile',
  },
  {
    path: 'customers',
    element: <CustomerList />,
    name: 'Customers',
  },
  {
    path: 'orders',
    element: <Orders />,
    name: 'Orders',
  },
  {
    path: 'reports',
    element: <Reports />,
    name: 'Reports',
  },
];
```

```javascript
// core/routing/routes/doctorRoutes.js
import React, { lazy } from 'react';

const Dashboard = lazy(() => import('@portals/doctor/modules/dashboard'));
const Profile = lazy(() => import('@portals/doctor/modules/profile'));
const PatientRecords = lazy(
  () => import('@portals/doctor/modules/patient-records')
);
const Prescriptions = lazy(
  () => import('@portals/doctor/modules/prescriptions')
);
const Appointments = lazy(() => import('@portals/doctor/modules/appointments'));

export const doctorRoutes = [
  {
    path: '',
    element: <Dashboard />,
    name: 'Dashboard',
  },
  {
    path: 'profile',
    element: <Profile />,
    name: 'Profile',
  },
  {
    path: 'patients',
    element: <PatientRecords />,
    name: 'Patient Records',
  },
  {
    path: 'prescriptions',
    element: <Prescriptions />,
    name: 'Prescriptions',
  },
  {
    path: 'appointments',
    element: <Appointments />,
    name: 'Appointments',
  },
];
```

### Main App Entry Point

```javascript
// App.jsx
import React, { Suspense } from 'react';
import AppRoutes from './core/routing/Routes';
import { AuthProvider } from './core/auth/AuthContext';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import ErrorBoundary from '@shared/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <AppRoutes />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
```

### URL Structure

The routing system creates the following URL patterns:

**Admin Portal:**

- `/admin` - Admin Dashboard
- `/admin/profile` - Admin Profile
- `/admin/users` - User Management

**Salesperson Portal:**

- `/salesperson` - Sales Dashboard
- `/salesperson/profile` - Salesperson Profile
- `/salesperson/customers` - Customer List
- `/salesperson/orders` - Orders

**Customer Portal:**

- `/customer` - Customer Dashboard
- `/customer/profile` - Customer Profile
- `/customer/medicines/123` - Medicine Details (with ID)
- `/customer/orders` - Order History
- `/customer/cart` - Shopping Cart

**Doctor Portal:**

- `/doctor` - Doctor Dashboard
- `/doctor/profile` - Doctor Profile
- `/doctor/patients` - Patient Records
- `/doctor/prescriptions` - Prescriptions
- `/doctor/appointments` - Appointments

### Navigation Within Portals

Each portal layout should include navigation components:

```javascript
// portals/customer/layouts/CustomerLayout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const CustomerLayout = () => {
  return (
    <div className="customer-layout">
      <Header />
      <div className="layout-container">
        <Sidebar>
          <nav>
            <Link to="/customer">Dashboard</Link>
            <Link to="/customer/profile">Profile</Link>
            <Link to="/customer/orders">Orders</Link>
            <Link to="/customer/cart">Cart</Link>
          </nav>
        </Sidebar>
        <main className="main-content">
          <Outlet /> {/* This renders the matched child route */}
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
```

### Programmatic Navigation

Use React Router's navigation hooks within components:

```javascript
// Inside a component
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to a specific route
    navigate('/customer/profile');
  };

  const handleBack = () => {
    // Go back to previous page
    navigate(-1);
  };

  const handleMedicineClick = medicineId => {
    // Navigate with parameters
    navigate(`/customer/medicines/${medicineId}`);
  };

  return (
    <div>
      <button onClick={handleClick}>Go to Profile</button>
      <button onClick={handleBack}>Go Back</button>
    </div>
  );
};
```

### Route Parameters

Access URL parameters using React Router hooks:

```javascript
// portals/customer/modules/medicine-description/index.js
import { useParams, useSearchParams } from 'react-router-dom';

const MedicineDescription = () => {
  // Get URL parameters (e.g., /customer/medicines/123)
  const { id } = useParams();

  // Get query parameters (e.g., /customer/medicines/123?tab=reviews)
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab');

  return (
    <div>
      <h1>Medicine ID: {id}</h1>
      <p>Active Tab: {activeTab}</p>
    </div>
  );
};
```

### Authentication Flow

1. **User visits the app** → Redirected to `/login` if not authenticated
2. **User logs in** → Authentication context stores user data and role
3. **After login** → User is redirected to their portal based on role:
   - Admin → `/admin`
   - Salesperson → `/salesperson`
   - Customer → `/customer`
   - Doctor → `/doctor`
4. **Protected routes** → Check if user has the required role
5. **Unauthorized access** → Redirect to `/unauthorized` page

### Route Guard Flow

```
User tries to access /admin/users
↓
ProtectedRoute checks authentication
↓
Not authenticated? → Redirect to /login
↓
Authenticated? → Check user role
↓
Role not allowed? → Redirect to /unauthorized
↓
Role allowed? → Render component
```

### Code Splitting and Lazy Loading

All route components use lazy loading for better performance:

**Benefits:**

- Smaller initial bundle size
- Faster initial page load
- Components loaded only when needed

**Implementation:**

```javascript
// Lazy load
const Dashboard = lazy(() => import('@portals/admin/modules/dashboard'));

// Wrap app in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <AppRoutes />
</Suspense>;
```

### Adding a New Route

To add a new route to a portal:

1. **Create the module** in the portal's modules folder
2. **Add the route** to the portal's route configuration file:

```javascript
// core/routing/routes/customerRoutes.js
const Wishlist = lazy(() => import('@portals/customer/modules/wishlist'));

export const customerRoutes = [
  // ... existing routes
  {
    path: 'wishlist',
    element: <Wishlist />,
    name: 'Wishlist',
  },
];
```

3. **Add navigation link** in the portal layout:

```javascript
<Link to="/customer/wishlist">Wishlist</Link>
```

### Route Configuration Best Practices

1. **Keep route configs simple** - Just path, element, and name
2. **Use lazy loading** - For all route components
3. **Consistent naming** - Match route path with module folder name
4. **Nested routes** - Use when you have sub-sections within a module
5. **Route parameters** - Use for dynamic content (e.g., `/medicines/:id`)
6. **Query parameters** - Use for filters, tabs, pagination (e.g., `?page=2&sort=price`)

---

## Shared Resources

### shared/components/

Reusable UI components used across multiple portals. These should be:

- Generic and configurable
- Well-documented with PropTypes or TypeScript
- Independent of business logic

**Example:**

```
shared/components/
├── Button/
│   ├── Button.jsx
│   ├── Button.module.css
│   ├── Button.test.js
│   └── index.js
```

### shared/hooks/

Custom React hooks shared across portals:

- `useAuth()` - Authentication state
- `useFetch()` - Generic data fetching
- `useDebounce()` - Debouncing utility

### shared/utils/

Helper functions and utilities:

- `formatDate()`
- `validateEmail()`
- `calculateDiscount()`

### shared/constants/

Application-wide constants:

- API endpoints
- Configuration values
- Enum-like constants

---

## Naming Conventions

### Folders

- Use **kebab-case** for all folder names
- Be descriptive and specific
- Examples: `user-management`, `medicine-description`, `sales-dashboard`

### Files

- **Components**: PascalCase (e.g., `ProfileHeader.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useProfile.js`)
- **Utilities**: camelCase (e.g., `formatDate.js`)
- **Constants**: UPPER_SNAKE_CASE or camelCase (e.g., `API_ENDPOINTS.js`)

### Components

- Use PascalCase for component names
- Match the component name with the file name
- Use descriptive names that indicate purpose

---

## Best Practices

### 1. Module Independence

Each module should be as independent as possible. Avoid tight coupling between modules within the same portal.

### 2. Shared vs Portal-Specific

**Use shared/** when:

- Component is used in 2+ portals
- Logic is generic and reusable
- No portal-specific business logic

**Keep in portal** when:

- Component is specific to one portal's business logic
- UI/UX is unique to that portal
- Tight coupling with portal-specific features

### 3. Component Composition

Build complex UIs by composing smaller, reusable components:

```javascript
// Good
<ProfilePage>
  <ProfileHeader />
  <ProfileForm />
  <ProfileActions />
</ProfilePage>

// Avoid: One large component with everything
```

### 4. Code Organization

- Keep files small and focused (< 300 lines)
- One component per file
- Export only what's necessary
- Use index.js for cleaner imports

### 5. State Management

- Local state: Use `useState` for UI-only state
- Module state: Use custom hooks or Context
- Global state: Use Redux/Zustand in `core/store/`

### 6. API Calls

- Centralize API calls in `core/api/`
- Use custom hooks for data fetching
- Handle loading and error states consistently

---

## Examples

### Example 1: Creating a New Module

Let's create a `medicine-description` module in the customer portal:

```bash
# 1. Create folder structure
mkdir -p src/portals/customer/modules/medicine-description/components
mkdir -p src/portals/customer/modules/medicine-description/hooks

# 2. Create files
touch src/portals/customer/modules/medicine-description/index.js
touch src/portals/customer/modules/medicine-description/components/MedicineCard.jsx
touch src/portals/customer/modules/medicine-description/hooks/useMedicine.js
```

**index.js:**

```javascript
import React from 'react';
import MedicineCard from './components/MedicineCard';
import { useMedicine } from './hooks/useMedicine';

const MedicineDescription = ({ medicineId }) => {
  const { medicine, loading, error } = useMedicine(medicineId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="medicine-description">
      <MedicineCard medicine={medicine} />
    </div>
  );
};

export default MedicineDescription;
```

### Example 2: Creating a Shared Component

```javascript
// shared/components/Button/Button.jsx
import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

const Button = ({ children, variant = 'primary', onClick, disabled }) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

export default Button;
```

### Example 3: Portal Layout

```javascript
// portals/admin/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main>
          <Outlet /> {/* Renders matched child routes */}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
```

### Example 4: Complete Page Flow

Let's trace how a user navigates to the medicine description page:

**Step 1: User clicks on a medicine card**

```javascript
// portals/customer/modules/dashboard/components/MedicineCard.jsx
import { useNavigate } from 'react-router-dom';

const MedicineCard = ({ medicine }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/customer/medicines/${medicine.id}`);
  };

  return (
    <div onClick={handleClick} className="medicine-card">
      <img src={medicine.image} alt={medicine.name} />
      <h3>{medicine.name}</h3>
      <p>{medicine.price}</p>
    </div>
  );
};
```

**Step 2: React Router matches the URL**

```
URL: /customer/medicines/123
↓
Matches route in customerRoutes.js
↓
Route: { path: 'medicines/:id', element: <MedicineDescription /> }
```

**Step 3: Component receives the ID parameter**

```javascript
// portals/customer/modules/medicine-description/index.js
import { useParams } from 'react-router-dom';
import { useMedicine } from './hooks/useMedicine';
import MedicineDetails from './components/MedicineDetails';

const MedicineDescription = () => {
  const { id } = useParams(); // Gets '123' from URL
  const { medicine, loading } = useMedicine(id);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <MedicineDetails medicine={medicine} />
    </div>
  );
};

export default MedicineDescription;
```

**Step 4: Custom hook fetches data**

```javascript
// portals/customer/modules/medicine-description/hooks/useMedicine.js
import { useState, useEffect } from 'react';
import { getMedicineById } from '@core/api/medicines';

export const useMedicine = id => {
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const data = await getMedicineById(id);
        setMedicine(data);
      } catch (error) {
        console.error('Error fetching medicine:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [id]);

  return { medicine, loading };
};
```

**Step 5: Component renders with data**

```javascript
// portals/customer/modules/medicine-description/components/MedicineDetails.jsx
const MedicineDetails = ({ medicine }) => {
  return (
    <div className="medicine-details">
      <h1>{medicine.name}</h1>
      <img src={medicine.image} alt={medicine.name} />
      <p>{medicine.description}</p>
      <p>Price: ${medicine.price}</p>
      <button>Add to Cart</button>
    </div>
  );
};

export default MedicineDetails;
```

### Example 5: Navigation Flow Diagram

```
User Action (Click Medicine)
         ↓
navigate('/customer/medicines/123')
         ↓
React Router matches route
         ↓
ProtectedRoute checks auth & role
         ↓
CustomerLayout renders
         ↓
<Outlet /> renders MedicineDescription
         ↓
useParams() extracts { id: '123' }
         ↓
useMedicine(123) fetches data
         ↓
Component renders with data
```

---

---

## Environment Configuration

### Overview

Our application uses environment-specific configuration files to manage different settings for development, staging, and production environments. This ensures security, flexibility, and proper configuration management across deployments.

### Environment Files Structure

```
project-root/
├── .env.development      # Local development settings
├── .env.staging         # Staging server settings
├── .env.production      # Production server settings
├── .env.example         # Template file (committed to git)
└── .gitignore           # Ensures .env files are not committed
```

### Environment Files

#### .env.development

Used for local development on developer machines.

```bash
# .env.development

# ============================================
# APPLICATION CONFIGURATION
# ============================================
VITE_APP_ENV=development
VITE_APP_NAME=Philbox - Medical Portal (Dev)
VITE_APP_VERSION=1.0.0

# ============================================
# API CONFIGURATION
# ============================================
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000
VITE_WS_URL=ws://localhost:5000

# ============================================
# AUTHENTICATION
# ============================================
VITE_AUTH_TOKEN_KEY=philbox_auth_token_dev
VITE_REFRESH_TOKEN_KEY=philbox_refresh_token_dev
VITE_SESSION_TIMEOUT=3600000

# ============================================
# FEATURE FLAGS
# ============================================
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_VIDEO_CONSULTATION=true
VITE_ENABLE_PRESCRIPTION_UPLOAD=true

# ============================================
# PAYMENT GATEWAYS (Public Keys Only)
# ============================================
# Stripe (Test Mode)
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_test_key_here

# JazzCash
VITE_JAZZCASH_RETURN_URL=http://localhost:3000/payment/jazzcash/callback

# EasyPaisa
VITE_EASYPAISA_RETURN_URL=http://localhost:3000/payment/easypaisa/callback

# ============================================
# THIRD PARTY SERVICES (Public Keys Only)
# ============================================
# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_dev_google_maps_api_key

# Cloudinary (Image/File Storage)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_dev
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_dev

# ============================================
# VIDEO CONSULTATION (WebRTC Configuration)
# ============================================
VITE_VIDEO_CALL_ENABLED=true
VITE_WEBRTC_STUN_SERVER=stun:stun.l.google.com:19302
VITE_VIDEO_MAX_DURATION=3600000
VITE_VIDEO_RECORDING_ENABLED=true

# ============================================
# STORAGE & CACHING
# ============================================
VITE_STORAGE_PREFIX=philbox_dev
VITE_CACHE_DURATION=300000

# ============================================
# LOGGING
# ============================================
VITE_LOG_LEVEL=debug
VITE_ENABLE_ERROR_REPORTING=false

# ============================================
# FILE UPLOAD LIMITS
# ============================================
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=.jpg,.jpeg,.png,.pdf,.doc,.docx
VITE_MAX_PRESCRIPTION_SIZE=10485760

# ============================================
# PHARMACY SPECIFIC
# ============================================
VITE_LOW_STOCK_THRESHOLD=10

# ============================================
# APPOINTMENT SETTINGS
# ============================================
VITE_APPOINTMENT_SLOT_DURATION=30
VITE_APPOINTMENT_BUFFER_TIME=5
VITE_APPOINTMENT_CANCELLATION_HOURS=24
```

#### .env.staging

Used for staging/testing environment before production.

```bash
# .env.staging

# ============================================
# APPLICATION CONFIGURATION
# ============================================
VITE_APP_ENV=staging
VITE_APP_NAME=Philbox - Medical Portal (Staging)
VITE_APP_VERSION=1.0.0

# ============================================
# API CONFIGURATION
# ============================================
VITE_API_BASE_URL=https://staging-api.philbox.com/api
VITE_API_TIMEOUT=30000
VITE_WS_URL=wss://staging-api.philbox.com

# ============================================
# AUTHENTICATION
# ============================================
VITE_AUTH_TOKEN_KEY=philbox_auth_token_staging
VITE_REFRESH_TOKEN_KEY=philbox_refresh_token_staging
VITE_SESSION_TIMEOUT=3600000

# ============================================
# FEATURE FLAGS
# ============================================
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_VIDEO_CONSULTATION=true
VITE_ENABLE_PRESCRIPTION_UPLOAD=true

# ============================================
# PAYMENT GATEWAYS (Public Keys Only)
# ============================================
# Stripe (Test Mode)
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_test_key_staging

# JazzCash
VITE_JAZZCASH_RETURN_URL=https://staging.philbox.com/payment/jazzcash/callback

# EasyPaisa
VITE_EASYPAISA_RETURN_URL=https://staging.philbox.com/payment/easypaisa/callback

# ============================================
# THIRD PARTY SERVICES (Public Keys Only)
# ============================================
# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_staging_google_maps_api_key

# Cloudinary (Image/File Storage)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_staging
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_staging

# ============================================
# VIDEO CONSULTATION (WebRTC Configuration)
# ============================================
VITE_VIDEO_CALL_ENABLED=true
VITE_WEBRTC_STUN_SERVER=stun:stun.l.google.com:19302
VITE_VIDEO_MAX_DURATION=3600000
VITE_VIDEO_RECORDING_ENABLED=true

# ============================================
# STORAGE & CACHING
# ============================================
VITE_STORAGE_PREFIX=philbox_staging
VITE_CACHE_DURATION=600000

# ============================================
# LOGGING
# ============================================
VITE_LOG_LEVEL=info
VITE_ENABLE_ERROR_REPORTING=true

# ============================================
# FILE UPLOAD LIMITS
# ============================================
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=.jpg,.jpeg,.png,.pdf,.doc,.docx
VITE_MAX_PRESCRIPTION_SIZE=10485760

# ============================================
# PHARMACY SPECIFIC
# ============================================
VITE_LOW_STOCK_THRESHOLD=10

# ============================================
# APPOINTMENT SETTINGS
# ============================================
VITE_APPOINTMENT_SLOT_DURATION=30
VITE_APPOINTMENT_BUFFER_TIME=5
VITE_APPOINTMENT_CANCELLATION_HOURS=24
```

#### .env.production

Used for production deployment.

```bash
# .env.production

# ============================================
# APPLICATION CONFIGURATION
# ============================================
VITE_APP_ENV=production
VITE_APP_NAME=Philbox - Medical Portal
VITE_APP_VERSION=1.0.0

# ============================================
# API CONFIGURATION
# ============================================
VITE_API_BASE_URL=https://api.philbox.com/api
VITE_API_TIMEOUT=30000
VITE_WS_URL=wss://api.philbox.com

# ============================================
# AUTHENTICATION
# ============================================
VITE_AUTH_TOKEN_KEY=philbox_auth_token_prod
VITE_REFRESH_TOKEN_KEY=philbox_refresh_token_prod
VITE_SESSION_TIMEOUT=3600000

# ============================================
# FEATURE FLAGS
# ============================================
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_VIDEO_CONSULTATION=true
VITE_ENABLE_PRESCRIPTION_UPLOAD=true

# ============================================
# PAYMENT GATEWAYS (Public Keys Only)
# ============================================
# Stripe (Live Mode)
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_live_key_here

# JazzCash
VITE_JAZZCASH_RETURN_URL=https://philbox.com/payment/jazzcash/callback

# EasyPaisa
VITE_EASYPAISA_RETURN_URL=https://philbox.com/payment/easypaisa/callback

# ============================================
# THIRD PARTY SERVICES (Public Keys Only)
# ============================================
# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_production_google_maps_api_key

# Cloudinary (Image/File Storage)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_prod
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_prod

# ============================================
# VIDEO CONSULTATION (WebRTC Configuration)
# ============================================
VITE_VIDEO_CALL_ENABLED=true
VITE_WEBRTC_STUN_SERVER=stun:stun.l.google.com:19302
VITE_WEBRTC_TURN_SERVER=turn:your-turn-server.com:3478
VITE_WEBRTC_TURN_USERNAME=your_turn_username
VITE_WEBRTC_TURN_CREDENTIAL=your_turn_credential
VITE_VIDEO_MAX_DURATION=3600000
VITE_VIDEO_RECORDING_ENABLED=true

# ============================================
# STORAGE & CACHING
# ============================================
VITE_STORAGE_PREFIX=philbox_prod
VITE_CACHE_DURATION=1800000

# ============================================
# LOGGING
# ============================================
VITE_LOG_LEVEL=error
VITE_ENABLE_ERROR_REPORTING=true

# ============================================
# FILE UPLOAD LIMITS
# ============================================
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=.jpg,.jpeg,.png,.pdf,.doc,.docx
VITE_MAX_PRESCRIPTION_SIZE=10485760

# ============================================
# PHARMACY SPECIFIC
# ============================================
VITE_LOW_STOCK_THRESHOLD=10

# ============================================
# APPOINTMENT SETTINGS
# ============================================
VITE_APPOINTMENT_SLOT_DURATION=30
VITE_APPOINTMENT_BUFFER_TIME=5
VITE_APPOINTMENT_CANCELLATION_HOURS=24
```

#### .env.example

Template file to show what environment variables are needed (this file IS committed to git).

```bash
# .env.example

# ============================================
# APPLICATION CONFIGURATION
# ============================================
VITE_APP_ENV=
VITE_APP_NAME=
VITE_APP_VERSION=

# ============================================
# API CONFIGURATION
# ============================================
VITE_API_BASE_URL=
VITE_API_TIMEOUT=
VITE_WS_URL=

# ============================================
# AUTHENTICATION
# ============================================
VITE_AUTH_TOKEN_KEY=
VITE_REFRESH_TOKEN_KEY=
VITE_SESSION_TIMEOUT=

# ============================================
# FEATURE FLAGS
# ============================================
VITE_ENABLE_DEBUG=
VITE_ENABLE_ANALYTICS=
VITE_ENABLE_VIDEO_CONSULTATION=
VITE_ENABLE_PRESCRIPTION_UPLOAD=

# ============================================
# PAYMENT GATEWAYS (Public Keys Only)
# ============================================
# Stripe
VITE_STRIPE_PUBLIC_KEY=

# JazzCash
VITE_JAZZCASH_RETURN_URL=

# EasyPaisa
VITE_EASYPAISA_RETURN_URL=

# ============================================
# THIRD PARTY SERVICES (Public Keys Only)
# ============================================
# Google Maps
VITE_GOOGLE_MAPS_API_KEY=

# Cloudinary (Image/File Storage)
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=

# ============================================
# VIDEO CONSULTATION (WebRTC Configuration)
# ============================================
VITE_VIDEO_CALL_ENABLED=
VITE_WEBRTC_STUN_SERVER=
VITE_WEBRTC_TURN_SERVER=
VITE_WEBRTC_TURN_USERNAME=
VITE_WEBRTC_TURN_CREDENTIAL=
VITE_VIDEO_MAX_DURATION=
VITE_VIDEO_RECORDING_ENABLED=

# ============================================
# STORAGE & CACHING
# ============================================
VITE_STORAGE_PREFIX=
VITE_CACHE_DURATION=

# ============================================
# LOGGING
# ============================================
VITE_LOG_LEVEL=
VITE_ENABLE_ERROR_REPORTING=

# ============================================
# FILE UPLOAD LIMITS
# ============================================
VITE_MAX_FILE_SIZE=
VITE_ALLOWED_FILE_TYPES=
VITE_MAX_PRESCRIPTION_SIZE=

# ============================================
# PHARMACY SPECIFIC
# ============================================
VITE_LOW_STOCK_THRESHOLD=

# ============================================
# APPOINTMENT SETTINGS
# ============================================
VITE_APPOINTMENT_SLOT_DURATION=
VITE_APPOINTMENT_BUFFER_TIME=
VITE_APPOINTMENT_CANCELLATION_HOURS=
```

### .gitignore Configuration

Add these lines to your `.gitignore` to prevent committing sensitive environment files:

```bash
# Environment Variables
.env.development
.env.staging
.env.production
.env.local
.env

# Keep example file
!.env.example
```

### Using Environment Variables in Code

#### Accessing Environment Variables in Vite

```javascript
// core/config/config.js
const config = {
  // Application
  env: import.meta.env.VITE_APP_ENV,
  appName: import.meta.env.VITE_APP_NAME,
  version: import.meta.env.VITE_APP_VERSION,

  // API
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT, 10),
    wsUrl: import.meta.env.VITE_WS_URL,
  },

  // Authentication
  auth: {
    tokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY,
    refreshTokenKey: import.meta.env.VITE_REFRESH_TOKEN_KEY,
    sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT, 10),
  },

  // Feature Flags
  features: {
    enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableVideoConsultation:
      import.meta.env.VITE_ENABLE_VIDEO_CONSULTATION === 'true',
    enablePrescriptionUpload:
      import.meta.env.VITE_ENABLE_PRESCRIPTION_UPLOAD === 'true',
  },

  // Payment Gateways (Public Keys Only)
  payment: {
    stripe: {
      publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    },
    jazzcash: {
      returnUrl: import.meta.env.VITE_JAZZCASH_RETURN_URL,
    },
    easypaisa: {
      returnUrl: import.meta.env.VITE_EASYPAISA_RETURN_URL,
    },
  },

  // Third Party Services (Public Keys Only)
  thirdParty: {
    googleMaps: {
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    },
    cloudinary: {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    },
  },

  // Video Consultation (WebRTC)
  video: {
    enabled: import.meta.env.VITE_VIDEO_CALL_ENABLED === 'true',
    stunServer: import.meta.env.VITE_WEBRTC_STUN_SERVER,
    turnServer: import.meta.env.VITE_WEBRTC_TURN_SERVER,
    turnUsername: import.meta.env.VITE_WEBRTC_TURN_USERNAME,
    turnCredential: import.meta.env.VITE_WEBRTC_TURN_CREDENTIAL,
    maxDuration: parseInt(import.meta.env.VITE_VIDEO_MAX_DURATION, 10),
    recordingEnabled: import.meta.env.VITE_VIDEO_RECORDING_ENABLED === 'true',
  },

  // Storage
  storage: {
    prefix: import.meta.env.VITE_STORAGE_PREFIX,
    cacheDuration: parseInt(import.meta.env.VITE_CACHE_DURATION, 10),
  },

  // Logging
  logging: {
    level: import.meta.env.VITE_LOG_LEVEL,
    enableErrorReporting:
      import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  },

  // File Upload
  fileUpload: {
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE, 10),
    allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [],
    maxPrescriptionSize: parseInt(
      import.meta.env.VITE_MAX_PRESCRIPTION_SIZE,
      10
    ),
  },

  // Pharmacy Specific
  pharmacy: {
    lowStockThreshold: parseInt(import.meta.env.VITE_LOW_STOCK_THRESHOLD, 10),
  },

  // Appointments
  appointments: {
    slotDuration: parseInt(import.meta.env.VITE_APPOINTMENT_SLOT_DURATION, 10),
    bufferTime: parseInt(import.meta.env.VITE_APPOINTMENT_BUFFER_TIME, 10),
    cancellationHours: parseInt(
      import.meta.env.VITE_APPOINTMENT_CANCELLATION_HOURS,
      10
    ),
  },
};

export default config;
```

#### Cloudinary Integration

```javascript
// shared/utils/cloudinaryUpload.js
import config from '@core/config/config';

export const uploadToCloudinary = async (file, folder = 'general') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.thirdParty.cloudinary.uploadPreset);
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.thirdParty.cloudinary.cloudName}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      resourceType: data.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Usage example for prescription upload
export const uploadPrescription = async file => {
  return uploadToCloudinary(file, 'prescriptions');
};

// Usage example for profile image upload
export const uploadProfileImage = async file => {
  return uploadToCloudinary(file, 'profiles');
};

// Usage example for medicine images
export const uploadMedicineImage = async file => {
  return uploadToCloudinary(file, 'medicines');
};
```

#### Video Consultation Configuration

```javascript
// core/config/webrtcConfig.js
import config from './config';

export const getWebRTCConfig = () => {
  const iceServers = [
    {
      urls: config.video.stunServer,
    },
  ];

  // Add TURN server for production (helps with NAT traversal)
  if (config.video.turnServer) {
    iceServers.push({
      urls: config.video.turnServer,
      username: config.video.turnUsername,
      credential: config.video.turnCredential,
    });
  }

  return {
    iceServers,
    iceCandidatePoolSize: 10,
  };
};

// Usage in video consultation component
// const peerConnection = new RTCPeerConnection(getWebRTCConfig());
```

#### SMS Notification Helper

```javascript
// shared/utils/notificationHelper.js
import config from '@core/config/config';

/**
 * Note: Actual SMS sending happens on backend via Twilio
 * This is a frontend helper to trigger the SMS API
 * Backend handles Twilio credentials securely
 */
export const triggerSMS = async (phoneNumber, message) => {
  try {
    const response = await fetch(`${config.api.baseUrl}/notifications/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(config.auth.tokenKey)}`,
      },
      body: JSON.stringify({
        to: phoneNumber,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error('SMS sending failed');
    }

    return await response.json();
  } catch (error) {
    console.error('SMS error:', error);
    throw error;
  }
};

/**
 * Email notifications (Backend handles Nodemailer)
 */
export const triggerEmail = async (to, subject, body) => {
  try {
    const response = await fetch(`${config.api.baseUrl}/notifications/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(config.auth.tokenKey)}`,
      },
      body: JSON.stringify({ to, subject, body }),
    });

    if (!response.ok) {
      throw new Error('Email sending failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};
```

#### API Client Configuration

```javascript
// core/api/client.js
import axios from 'axios';
import config from '../config/config';

const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  requestConfig => {
    const token = localStorage.getItem(config.auth.tokenKey);
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (config.features.enableDebug) {
      console.error('API Error:', error);
    }

    // Handle token refresh on 401
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem(config.auth.refreshTokenKey);
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${config.api.baseUrl}/auth/refresh`,
            {
              refreshToken,
            }
          );
          const newToken = response.data.token;
          localStorage.setItem(config.auth.tokenKey, newToken);
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axios(error.config);
        } catch (refreshError) {
          // Redirect to login
          localStorage.removeItem(config.auth.tokenKey);
          localStorage.removeItem(config.auth.refreshTokenKey);
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

#### Payment Integration Examples

```javascript
// shared/utils/paymentHelpers.js
import config from '@core/config/config';
import { loadStripe } from '@stripe/stripe-js';

// Stripe Integration (Frontend Only)
const stripePromise = loadStripe(config.payment.stripe.publicKey);

export const initiateStripePayment = async (amount, description) => {
  try {
    const stripe = await stripePromise;

    // Call your backend to create payment intent
    // Backend will handle secret keys
    const response = await fetch(
      `${config.api.baseUrl}/payments/stripe/create-intent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(config.auth.tokenKey)}`,
        },
        body: JSON.stringify({ amount, description }),
      }
    );

    const { clientSecret } = await response.json();

    // Confirm payment with Stripe (frontend)
    const result = await stripe.confirmCardPayment(clientSecret);

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.paymentIntent;
  } catch (error) {
    console.error('Stripe payment error:', error);
    throw error;
  }
};

// JazzCash Integration (Frontend initiates, backend handles credentials)
export const initiateJazzCashPayment = async (amount, orderId) => {
  try {
    // Backend will handle merchant credentials and signature
    const response = await fetch(
      `${config.api.baseUrl}/payments/jazzcash/initiate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(config.auth.tokenKey)}`,
        },
        body: JSON.stringify({
          amount,
          orderId,
          returnUrl: config.payment.jazzcash.returnUrl,
        }),
      }
    );

    const data = await response.json();

    // Redirect to JazzCash payment page
    window.location.href = data.paymentUrl;
  } catch (error) {
    console.error('JazzCash payment error:', error);
    throw error;
  }
};

// EasyPaisa Integration (Frontend initiates, backend handles credentials)
export const initiateEasyPaisaPayment = async (amount, orderId) => {
  try {
    // Backend will handle store credentials
    const response = await fetch(
      `${config.api.baseUrl}/payments/easypaisa/initiate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(config.auth.tokenKey)}`,
        },
        body: JSON.stringify({
          amount,
          orderId,
          returnUrl: config.payment.easypaisa.returnUrl,
        }),
      }
    );

    const data = await response.json();

    // Redirect to EasyPaisa payment page
    window.location.href = data.paymentUrl;
  } catch (error) {
    console.error('EasyPaisa payment error:', error);
    throw error;
  }
};
```

#### Feature Flags Usage

```javascript
// shared/components/DebugPanel.jsx
import React from 'react';
import config from '@core/config/config';

const DebugPanel = ({ data }) => {
  // Only render in development
  if (!config.features.enableDebug) {
    return null;
  }

  return (
    <div className="debug-panel">
      <h3>Debug Information</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default DebugPanel;
```

#### Conditional Mock Data

```javascript
// core/api/medicines.js
import apiClient from './client';
import config from '../config/config';
import mockMedicines from '../mocks/medicines';

export const getMedicines = async () => {
  // Use mock data in development if enabled
  if (config.features.enableMockData) {
    return Promise.resolve(mockMedicines);
  }

  const response = await apiClient.get('/medicines');
  return response.data;
};
```

### Running the Application with Different Environments

#### Package.json Scripts (Vite)

```json
{
  "scripts": {
    "dev": "vite",
    "dev:staging": "vite --mode staging",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "build:staging": "vite build --mode staging",
    "build:prod": "vite build --mode production",
    "preview": "vite preview"
  }
}
```

#### Running Commands

```bash
# Development (uses .env.development by default)
npm run dev

# Staging
npm run dev:staging

# Production build
npm run build:prod

# Preview production build locally
npm run preview
```

#### Vite Mode Configuration

Vite automatically loads environment files based on the mode:

- `npm run dev` loads `.env.development`
- `npm run dev:staging` loads `.env.staging`
- `npm run build:prod` loads `.env.production`

You can also create mode-specific files:

- `.env.development.local` - local overrides for development (not committed)
- `.env.staging.local` - local overrides for staging (not committed)
- `.env.production.local` - local overrides for production (not committed)

### Environment Variable Best Practices

1. **Naming Convention (Vite Specific)**
   - Always prefix with `VITE_` (Vite requirement for client-side exposure)
   - Use UPPER_SNAKE_CASE
   - Be descriptive and clear
   - Example: `VITE_API_BASE_URL`, `VITE_STRIPE_PUBLIC_KEY`

2. **Security (Frontend Only)**
   - Never commit actual .env files (except .env.example)
   - **CRITICAL**: Only include public/client-safe values in frontend
   - Never include API secrets, private keys, or passwords
   - Backend handles all sensitive credentials (Twilio auth token, payment secrets, etc.)
   - Only public keys allowed: Stripe public key, Cloudinary cloud name, Google Maps API key

3. **Frontend vs Backend Separation**
   - **Frontend (.env)**: Public keys, API URLs, return URLs, feature flags, UI configuration
   - **Backend (.env)**: Private keys, secrets, credentials, auth tokens, database passwords
   - Frontend only knows WHERE to send requests, backend handles HOW to authenticate

4. **Documentation**
   - Keep .env.example up to date
   - Document what each variable does
   - Include example values when appropriate
   - Mark which values are public vs need to be obtained

5. **Organization**
   - Group related variables together
   - Use comments to separate sections
   - Keep consistent ordering across all env files

6. **Type Conversion**
   - Environment variables are always strings
   - Convert to appropriate types (parseInt, === 'true')
   - Provide defaults when necessary

7. **Vite-Specific Notes**
   - Only variables prefixed with `VITE_` are exposed to client code
   - Access via `import.meta.env.VITE_*` not `process.env.*`
   - Variables are statically replaced at build time

### Environment-Specific Configuration Example

```javascript
// core/config/environment.js
const environments = {
  development: {
    apiRetries: 3,
    cacheDuration: 5000,
    enableDevTools: true,
  },
  staging: {
    apiRetries: 3,
    cacheDuration: 60000,
    enableDevTools: true,
  },
  production: {
    apiRetries: 5,
    cacheDuration: 300000,
    enableDevTools: false,
  },
};

export const getEnvironmentConfig = () => {
  const env = process.env.REACT_APP_ENV || 'development';
  return environments[env];
};
```

### Validating Environment Variables

```javascript
// core/config/validateEnv.js
const requiredEnvVars = [
  'VITE_APP_ENV',
  'VITE_API_BASE_URL',
  'VITE_AUTH_TOKEN_KEY',
  'VITE_CLOUDINARY_CLOUD_NAME',
  'VITE_GOOGLE_MAPS_API_KEY',
];

export const validateEnvironment = () => {
  const missingVars = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  // Log environment in development
  if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
    console.log('Environment:', import.meta.env.VITE_APP_ENV);
    console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
  }
};

// Call this in your app entry point (main.jsx)
// validateEnvironment();
```

### Vite Configuration for Environment Variables

```javascript
// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@portals': path.resolve(__dirname, './src/portals'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@core': path.resolve(__dirname, './src/core'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
```

### Setting Up New Developers

When a new developer joins the team:

1. **Copy the example file:**

   ```bash
   cp .env.example .env.development
   ```

2. **Fill in the values:**
   - Get public API keys from team lead (Google Maps, Cloudinary public info)
   - Use local development URLs (http://localhost:5000/api)
   - Set feature flags for local testing
   - **Note**: Never request or store backend secrets in frontend env

3. **Verify Vite prefix:**
   - Ensure all variables start with `VITE_`
   - Variables without `VITE_` prefix won't be accessible in code

4. **Test the configuration:**
   ```bash
   npm run dev
   ```

### CI/CD Pipeline Configuration

For automated deployments, inject environment variables through your CI/CD platform:

**GitHub Actions Example:**

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build for Staging
        env:
          VITE_APP_ENV: staging
          VITE_API_BASE_URL: ${{ secrets.STAGING_API_URL }}
          VITE_STRIPE_PUBLIC_KEY: ${{ secrets.STAGING_STRIPE_PUBLIC_KEY }}
          VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.STAGING_GOOGLE_MAPS_KEY }}
          VITE_CLOUDINARY_CLOUD_NAME: ${{ secrets.STAGING_CLOUDINARY_NAME }}
        run: npm run build:staging

      - name: Deploy to Vercel/Netlify
        run: # your deployment command
```

**Important Notes for CI/CD:**

- Store only public keys in CI/CD secrets for frontend
- Never expose backend credentials through frontend build
- Use separate secret management for backend deployment
- Frontend only needs public API keys and URLs

### TypeScript Support (Optional)

If using TypeScript, create environment type definitions:

```typescript
// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_WS_URL: string;
  readonly VITE_AUTH_TOKEN_KEY: string;
  readonly VITE_REFRESH_TOKEN_KEY: string;
  readonly VITE_SESSION_TIMEOUT: string;
  readonly VITE_ENABLE_DEBUG: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_STRIPE_PUBLIC_KEY: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
  // Add other env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## File Import Guidelines

### Absolute Imports

Configure absolute imports in your bundler config (e.g., `jsconfig.json` or `tsconfig.json`):

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@portals/*": ["portals/*"],
      "@shared/*": ["shared/*"],
      "@core/*": ["core/*"]
    }
  }
}
```

**Usage:**

```javascript
// Instead of: import Button from '../../../shared/components/Button';
import Button from '@shared/components/Button';
import { useAuth } from '@core/auth';
```

---

## Adding New Features Checklist

When adding a new feature, follow this checklist:

- [ ] Identify which portal(s) the feature belongs to
- [ ] Create a new module folder under the appropriate portal
- [ ] Set up the basic module structure (components, hooks, index.js)
- [ ] Identify reusable components and add them to `shared/`
- [ ] Implement module-specific components
- [ ] Create custom hooks for data fetching/state management
- [ ] Add proper error handling and loading states
- [ ] Write unit tests for components and hooks
- [ ] Update routing configuration in `core/routing/`
- [ ] Document any new patterns or conventions
- [ ] Code review and merge

---

## Questions?

If you have questions about this architecture or need clarification on where to place a new feature, please:

1. Review this documentation thoroughly
2. Check existing modules for similar patterns
3. Discuss with the team lead
4. Update this documentation if you discover gaps

---

## Contributing

When you identify improvements to this structure:

1. Discuss proposed changes with the team
2. Update this README with the new conventions
3. Create migration guides if breaking changes are introduced
4. Notify the team of significant changes

**Last Updated**: November 30, 2025
**Maintained By**: Syed Abdul Ali Shah
