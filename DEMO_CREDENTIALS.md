# Demo Credentials & Testing Guide

## 🎭 User Accounts

### Customer Accounts
**Used for**: Browsing menus, placing orders, tracking deliveries

| Username | Password | Use Case |
|----------|----------|----------|
| `student` | `password123` | Student ordering food |
| `faculty` | `password123` | Faculty ordering food |

**Capabilities:**
- Browse all dining locations
- View menus and add items to cart
- Place orders and select drop-off locations
- Track order status
- View order history
- Submit feedback

---

### Delivery Driver
**Used for**: Managing deliveries

| Username | Password | Use Case |
|----------|----------|----------|
| `driver1` | `password123` | Campus delivery driver |

**Capabilities:**
- View available orders for pickup
- Accept orders for delivery
- Update delivery status
- Mark orders as delivered
- View delivery history

**Demo Workflow:**
1. Login as `driver1`
2. Go to Driver Dashboard
3. View available orders (status: pending or preparing)
4. Accept an order
5. Update status to "out-for-delivery"
6. Complete delivery and mark as "delivered"

---

### Restaurant Staff
**Used for**: Managing restaurant menus

| Username | Password | Restaurant | Location ID |
|----------|----------|------------|-------------|
| `staff_caton` | `password123` | Catons Café | caton |
| `staff_dunk` | `password123` | Dunkin' @ Commons | dunk |

**Capabilities:**
- Manage menu items for assigned restaurant
- Add new menu items
- Update existing items
- Delete items
- View orders from their restaurant
- View sales statistics

**Demo Workflow:**
1. Login as `staff_caton`
2. Go to Restaurant Dashboard
3. View current menu items
4. Add a new menu item (e.g., "Turkey Sandwich", $8.50)
5. Update an existing item
6. View orders from Catons Café

**Note:** Each staff member can ONLY manage their assigned restaurant's menu.

---

### Admin
**Used for**: System administration and monitoring

| Username | Password | Use Case |
|----------|----------|----------|
| `admin` | `admin123` | System administrator |

**Capabilities:**
- View system-wide statistics
- Manage all users
- Access all restaurants and menus
- View all orders across all restaurants
- View all feedback
- System monitoring and analytics

**Demo Workflow:**
1. Login as `admin`
2. Go to Admin Dashboard
3. View system statistics:
   - Total orders, users, revenue
   - Order status breakdown
   - User role distribution
   - Average feedback ratings
4. View all users
5. View all feedback across the platform

---

## 🔄 Complete Demo Scenario

### Scenario: Full Order Lifecycle

**Step 1: Customer Places Order**
```
1. Login as: student / password123
2. Browse Catons Café menu
3. Add "Chicken Wrap" to cart
4. Go to checkout
5. Select drop-off: "Campus Center"
6. Place order
7. Order ID generated: ORD-XXXXX
```

**Step 2: Restaurant Prepares Order**
```
1. Login as: staff_caton / password123
2. Go to Restaurant Dashboard
3. View pending orders
4. Update order status to "preparing"
```

**Step 3: Driver Picks Up & Delivers**
```
1. Login as: driver1 / password123
2. Go to Driver Dashboard
3. View available orders
4. Accept order ORD-XXXXX
5. Update status to "out-for-delivery"
6. Complete delivery
7. Mark as "delivered"
```

**Step 4: Customer Provides Feedback**
```
1. Login as: student / password123
2. Go to Order History
3. Select delivered order
4. Click "Leave Feedback"
5. Rate: 5 stars
6. Comment: "Great service!"
7. Submit feedback
```

**Step 5: Admin Reviews System**
```
1. Login as: admin / admin123
2. Go to Admin Dashboard
3. View system statistics
4. Review all feedback
5. Monitor order trends
```

---

## 🧪 Testing API Endpoints

### Test Customer Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"password123"}'
```

### Test Restaurant Staff (Catons)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"staff_caton","password":"password123"}'
```

### Test Driver
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"driver1","password":"password123"}'
```

### Test Admin
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🎯 Quick Reference Table

| Role | Login Username | Default Password | Can Access |
|------|---------------|------------------|------------|
| Customer | `student`, `faculty` | `password123` | Menus, Orders, Feedback |
| Driver | `driver1` | `password123` | Available Orders, Delivery Management |
| Staff | `staff_caton`, `staff_dunk` | `password123` | Restaurant Menu, Orders |
| Admin | `admin` | `admin123` | Everything |

---

## 🔒 Security Notes

- All passwords are hashed in production (currently using mock data)
- JWT tokens expire after 24 hours
- Role-based access enforced on all protected routes
- Restaurant staff can only modify their assigned location
- Customers can only view their own orders

---

## 📞 Support

For issues or questions during demos:
- Backend logs: Check terminal running `node server.js`
- Frontend logs: Check browser console
- API testing: Use Postman or curl with above commands
- Database: SQLite file at `backend/data/doordash.db`


