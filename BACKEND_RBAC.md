# RBAC Implementation Guide

## Overview

The backend implements Role-Based Access Control (RBAC) with 4 distinct user roles, each with specific permissions and access levels.

## User Roles

### 1. Customer
**Default users who place orders**

**Credentials:**
- `student` / `password123`
- `faculty` / `password123`

**Permissions:**
- ✅ View all menus and locations
- ✅ Add items to cart
- ✅ Place orders
- ✅ View own order history
- ✅ Track own orders
- ✅ Submit feedback

**Access:**
- `/api/locations/*`
- `/api/menu/*`
- `/api/orders` (GET own, POST new)
- `/api/feedback/*`

---

### 2. Delivery Driver
**Workers who deliver orders**

**Credentials:**
- `driver1` / `password123`

**Permissions:**
- ✅ View available orders for pickup
- ✅ Accept orders for delivery
- ✅ Update order status (out-for-delivery, delivered)
- ✅ View delivery history
- ❌ Cannot modify menus
- ❌ Cannot view customer personal info
- ❌ Cannot access admin features

**Access:**
- `/api/driver/orders` - Get available orders
- `/api/driver/orders/:orderId/accept` - Accept order
- `/api/driver/orders/:orderId/deliver` - Mark as delivered
- `/api/driver/my-deliveries` - View history

---

### 3. Restaurant Staff
**Staff who manage specific restaurant menus**

**Credentials:**
- `staff_caton` / `password123` (Catons Café)
- `staff_dunk` / `password123` (Dunkin' @ Commons)

**Permissions:**
- ✅ Manage menu items for their assigned restaurant
- ✅ Add/edit/delete menu items
- ✅ View orders from their restaurant
- ✅ View sales for their location
- ❌ Cannot access other restaurants
- ❌ Cannot manage drivers
- ❌ Cannot access customer data

**Access:**
- `/api/restaurant/menu` - Get/Add menu items
- `/api/restaurant/menu/:itemId` - Update/Delete items
- `/api/restaurant/orders` - View restaurant orders

**Restaurant Assignment:**
Each staff member is assigned to one location via `restaurant_location_id` in their user record.

---

### 4. Admin
**System administrators with full access**

**Credentials:**
- `admin` / `admin123`

**Permissions:**
- ✅ Full access to all features
- ✅ View system statistics
- ✅ Manage all users
- ✅ Access all restaurants and menus
- ✅ View all orders and feedback
- ✅ No restrictions

**Access:**
- All routes with admin prefix
- Override permissions for restaurant/driver routes
- `/api/admin/stats` - System statistics
- `/api/admin/users` - User management
- `/api/admin/feedback` - All feedback
- `/api/admin/locations` - Location management

---

## API Endpoints by Role

### Public Endpoints (No Auth Required)
- `GET /api/locations`
- `GET /api/locations/:id`
- `GET /api/menu/:locationId`

### Customer Endpoints
- `GET /api/orders` - Get own orders
- `POST /api/orders` - Create order
- `GET /api/orders/:orderId` - Get specific order
- `POST /api/feedback` - Submit feedback

### Driver Endpoints
- `GET /api/driver/orders` - Available orders
- `POST /api/driver/orders/:orderId/accept` - Accept delivery
- `POST /api/driver/orders/:orderId/deliver` - Complete delivery
- `GET /api/driver/my-deliveries` - Delivery history

### Restaurant Staff Endpoints
- `GET /api/restaurant/menu` - Get restaurant menu
- `POST /api/restaurant/menu` - Add menu item
- `PUT /api/restaurant/menu/:itemId` - Update menu item
- `DELETE /api/restaurant/menu/:itemId` - Delete menu item
- `GET /api/restaurant/orders` - Restaurant orders

### Admin Endpoints
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - All users
- `POST /api/admin/users` - Create user
- `GET /api/admin/feedback` - All feedback
- `GET /api/admin/locations` - All locations with stats
- Can access any route by adding auth header

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <token>
```

**Get Token:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "student",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "student",
    "role": "customer",
    "restaurant_location_id": null
  }
}
```

---

## Role Enforcement

Role checks are enforced via middleware:

```javascript
import { verifyToken, requireRole, ROLES } from '../middleware/auth.js';

// Example: Driver-only route
router.get('/orders', 
  verifyToken, 
  requireRole(ROLES.DRIVER, ROLES.ADMIN),
  async (req, res) => {
    // Only drivers and admins can access
  }
);
```

---

## Testing Roles

### Test as Customer:
```bash
# Login as student
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"password123"}'

# Use token from response
TOKEN="..."

# Try to access driver routes (should fail)
curl http://localhost:3001/api/driver/orders \
  -H "Authorization: Bearer $TOKEN"
# Returns 403: Insufficient permissions
```

### Test as Driver:
```bash
# Login as driver
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"driver1","password":"password123"}'

# Accept an order
curl -X POST http://localhost:3001/api/driver/orders/ORD123/accept \
  -H "Authorization: Bearer $TOKEN"
```

### Test as Restaurant Staff:
```bash
# Login as staff
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"staff_caton","password":"password123"}'

# Add menu item
curl -X POST http://localhost:3001/api/restaurant/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"c3","name":"New Item","description":"Test","price":10.0}'
```

### Test as Admin:
```bash
# Login as admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get system stats
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,  -- 'customer', 'driver', 'restaurant_staff', 'admin'
  restaurant_location_id TEXT,  -- NULL for all except restaurant_staff
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Role Verification** - Every protected route checks user role
3. **Restaurant Isolation** - Staff can only manage their assigned location
4. **Input Validation** - All inputs sanitized
5. **SQL Injection Prevention** - Parameterized queries

---

## Future Enhancements

- [ ] Fine-grained permissions within roles
- [ ] Permission inheritance
- [ ] Audit logging of role-based actions
- [ ] Multi-location access for staff
- [ ] Role delegation
- [ ] Session management with refresh tokens

