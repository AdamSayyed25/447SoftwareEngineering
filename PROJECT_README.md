# UMBC DoorDash Prototype

A campus-focused food delivery platform for the University of Maryland, Baltimore County (UMBC) community.

## Overview

This project is a full-stack prototype implementation meeting the requirements outlined in the Software Requirements Specification (SRS). It includes a React frontend and Node.js/Express backend with persistent data storage.

## Features

### Core Functionality
- ✅ Browse campus dining locations and menus
- ✅ Add items to cart
- ✅ Place simulated orders
- ✅ Track order status in real-time
- ✅ View order history
- ✅ Submit feedback on orders
- ✅ User authentication

### Technical Features
- **Frontend**: React + Vite with responsive design
- **Backend**: Node.js + Express RESTful API
- **Database**: SQLite for persistent storage
- **Authentication**: JWT-based login system
- **Security**: Input validation and sanitization

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm

### Installation

1. **Install frontend dependencies:**
```bash
npm install
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Seed the database:**
```bash
npm run seed
```

4. **Start the backend server:**
```bash
npm run dev
```

5. **In a new terminal, start the frontend:**
```bash
npm run dev
```

6. Visit `http://localhost:5173` in your browser

## Demo Credentials

- **Student**: `student` / `password123`
- **Faculty**: `faculty` / `password123`  
- **Admin**: `admin` / `admin123`

## Project Structure

```
447SoftwareEngineering/
├── backend/                 # Backend API server
│   ├── database/           # Database initialization
│   ├── routes/             # API endpoints
│   ├── middleware/         # Middleware functions
│   ├── scripts/            # Utility scripts
│   └── server.js           # Main server file
├── src/                     # Frontend React app
│   ├── components/         # React components
│   ├── services/           # API integration layer
│   ├── contexts/           # React contexts
│   ├── data/               # Mock data (legacy)
│   └── App.jsx             # Main app component
├── BACKEND_SETUP.md        # Detailed backend setup guide
├── BACKEND_SUMMARY.md      # Backend implementation summary
└── PROJECT_README.md       # This file
```

## API Documentation

### Endpoints

**Authentication:**
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

**Locations:**
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get specific location
- `GET /api/locations/dropoffs/all` - Get drop-off points

**Menu:**
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:locationId` - Get menu by location

**Orders:**
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:orderId` - Get order by ID
- `PATCH /api/orders/:orderId/status` - Update order status

**Feedback:**
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get all feedback
- `GET /api/feedback/:orderId` - Get feedback by order

For detailed API documentation, see `BACKEND_SETUP.md`.

## Development

### Running in Development Mode

Frontend and backend support hot-reload:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Building for Production

```bash
# Build frontend
npm run build

# Frontend will be in dist/ folder
```

## Testing

### Manual Testing Checklist

1. ✅ Login with demo credentials
2. ✅ Browse dining locations
3. ✅ View menus
4. ✅ Add items to cart
5. ✅ Complete checkout
6. ✅ View order confirmation
7. ✅ Track order status
8. ✅ View order history
9. ✅ Submit feedback

### API Testing

Use curl or Postman to test endpoints:

```bash
# Get locations
curl http://localhost:3001/api/locations

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"password123"}'
```

## Requirements Compliance

This implementation meets the following SRS requirements:

### Functional Requirements
- FR-1: View all dining locations ✅
- FR-2: View menus ✅
- FR-4: Add items to cart ✅
- FR-5: Review order ✅
- FR-6: Select delivery options ✅
- FR-7: Order confirmation ✅
- FR-8: Order assignment simulation ✅
- FR-9: Delivery status tracking ✅
- FR-10: Order storage ✅
- FR-11: Submit feedback ✅
- FR-12: View feedback (admin) ✅

### Non-Functional Requirements
- NFR-1: Performance (< 2s page loads) ✅
- NFR-2: Responsive design ✅
- NFR-3: Handle 50+ concurrent users ✅
- NFR-4: Input sanitization ✅
- NFR-5: Modular code structure ✅
- NFR-6: Browser compatibility ✅

## Security Considerations

For prototype/academic use:
- ✅ Input sanitization
- ✅ JWT authentication
- ✅ CORS protection
- ✅ SQL injection prevention

**Note:** This is a prototype. For production:
- Implement proper password hashing
- Add rate limiting
- Use HTTPS
- Implement comprehensive RBAC
- Add comprehensive input validation

## Future Enhancements

- [ ] Real UMBC SSO integration
- [ ] Payment processing (PayPal, campus card)
- [ ] Real-time GPS tracking
- [ ] Admin analytics dashboard
- [ ] Mobile application
- [ ] Push notifications
- [ ] Delivery worker app
- [ ] Advanced order management

## Documentation

- `BACKEND_SETUP.md` - Detailed backend setup and API documentation
- `BACKEND_SUMMARY.md` - Backend implementation summary
- `SPRINT1_REVIEW.md` - Sprint 1 review notes
- `README` - Original project README

## License

Academic project for CMSC 447 - Software Engineering

## Contributors

- Software Engineering Team
- CMSC 447 Class

## Contact

For questions about this prototype, contact the development team.



