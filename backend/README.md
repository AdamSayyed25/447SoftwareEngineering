# UMBC DoorDash Backend API

Backend server for the UMBC DoorDash food delivery prototype.

## Features

- RESTful API endpoints for orders, menu, locations, and feedback
- SQLite database for data persistence
- JWT-based authentication (prototype mode)
- CORS enabled for frontend integration
- Input validation and error handling

## Requirements

- Node.js 18+ 
- npm

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults provided):
```bash
cp .env.example .env
```

3. Seed the database with initial data:
```bash
npm run seed
```

## Running the Server

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
- `GET /api/locations/dropoffs/all` - Get all drop-off locations

### Menu

- `GET /api/menu` - Get all menu items
- `GET /api/menu/:locationId` - Get menu for specific location

### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:orderId` - Get specific order
- `PATCH /api/orders/:orderId/status` - Update order status

### Feedback

- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get all feedback
- `GET /api/feedback/:orderId` - Get feedback for order

## Database Schema

- `users` - User accounts
- `locations` - Dining locations
- `menu_items` - Menu items per location
- `drop_off_locations` - Campus drop-off points
- `orders` - Order records
- `feedback` - User feedback

## Demo Credentials

For prototype testing:
- Username: `student`, Password: `password123`
- Username: `faculty`, Password: `password123`
- Username: `admin`, Password: `admin123`

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)
- `JWT_SECRET` - JWT signing secret
- `DB_PATH` - Database file path
- `FRONTEND_URL` - CORS allowed origin

## Security Notes

This is a prototype implementation for academic purposes. For production:

- Implement proper password hashing and storage
- Add rate limiting
- Use HTTPS
- Implement proper session management
- Add input sanitization middleware
- Implement role-based access control (RBAC)

## License

ISC

