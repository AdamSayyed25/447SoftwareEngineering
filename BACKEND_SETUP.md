# UMBC DoorDash Backend Setup Guide

This guide will help you set up and run the backend API for the UMBC DoorDash prototype.

## Architecture

The backend is built with:
- **Node.js** + **Express** - RESTful API server
- **SQLite** - Lightweight database for prototype
- **JWT** - Authentication (prototype mode)
- **CORS** - Cross-origin resource sharing

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Seed the Database

```bash
npm run seed
```

This will create the database with initial data including:
- 3 dining locations (Catons Café, Dunkin', Yummy Noodles)
- Sample menu items
- Drop-off locations
- Demo user accounts

### 3. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password
- `GET /api/auth/verify` - Verify JWT token

### Locations
- `GET /api/locations` - Get all dining locations
- `GET /api/locations/:id` - Get specific location
- `GET /api/locations/dropoffs/all` - Get drop-off locations

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:locationId` - Get menu for location

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:orderId` - Get specific order
- `PATCH /api/orders/:orderId/status` - Update order status

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get all feedback
- `GET /api/feedback/:orderId` - Get feedback for order

## Demo Credentials

For prototype testing, use these credentials:

- **Student**: `student` / `password123`
- **Faculty**: `faculty` / `password123`
- **Admin**: `admin` / `admin123`

## Frontend Integration

The frontend is configured to connect to `http://localhost:3001/api` by default.

To change the API URL, set the environment variable:
```bash
VITE_API_URL=http://localhost:3001/api
```

## Database Schema

The backend uses SQLite with the following tables:

- **users** - User accounts (for future expansion)
- **locations** - Dining locations
- **menu_items** - Menu items per location
- **drop_off_locations** - Campus drop-off points
- **orders** - Order records
- **feedback** - User feedback

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-here
DB_PATH=./data/doordash.db
FRONTEND_URL=http://localhost:5173
```

## Running Both Frontend and Backend

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
npm run dev
```

Then visit `http://localhost:5173` in your browser.

## Testing the API

### Using curl:

```bash
# Health check
curl http://localhost:3001/health

# Get locations
curl http://localhost:3001/api/locations

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"password123"}'

# Create order (requires token from login)
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"items":[{"id":"c1","name":"Chicken Wrap","price":7.5,"qty":1}],"subtotal":7.5,"dropOffLocation":"CC"}'
```

## Troubleshooting

### Port Already in Use
If port 3001 is already in use, change it in the `.env` file.

### Database Errors
Delete the database file and re-seed:
```bash
rm backend/data/doordash.db
npm run seed
```

### CORS Errors
Make sure `FRONTEND_URL` in `.env` matches your frontend URL.

## Security Notes

This is a prototype implementation for academic purposes. For production:

- Implement proper password hashing
- Add rate limiting
- Use HTTPS
- Implement RBAC
- Add input sanitization
- Use secure session management

## File Structure

```
backend/
├── database/
│   └── initDatabase.js    # Database initialization
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── locations.js      # Location routes
│   ├── menu.js           # Menu routes
│   ├── orders.js         # Order routes
│   └── feedback.js       # Feedback routes
├── middleware/
│   └── validation.js     # Input validation
├── scripts/
│   └── seedDatabase.js   # Database seeding
├── server.js             # Main server file
├── package.json
└── README.md
```

## Next Steps

- Implement real authentication with UMBC SSO
- Add payment processing integration
- Implement real-time order tracking
- Add admin dashboard
- Deploy to cloud hosting



