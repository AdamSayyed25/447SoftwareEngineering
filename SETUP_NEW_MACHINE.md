# Setting Up on a New Machine

This guide explains how to clone the repository and set up the development environment on a new computer.

## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Git](https://git-scm.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) (if running locally) or a MongoDB Atlas URI

## 1. Clone the Repository
Open your terminal and run:
```bash
git clone <your-repo-url>
cd 447SoftwareEngineering
```

## 2. Install Dependencies
You need to install dependencies for both the frontend and backend.

### Frontend
```bash
# In the root directory
npm install
```

### Backend
```bash
cd backend
npm install
```

## 3. Configure Environment Variables (The "Keys")
**IMPORTANT:** Security keys are not saved in Git for safety. You must create a `.env` file manually on the new machine.

1.  Navigate to the `backend` folder.
2.  Create a new file named `.env`.
3.  Copy the following template and fill in your values (you can get these from your original machine's `backend/.env` file):

```env
# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database
# If using local MongoDB: mongodb://localhost:27017/umbc-doordash
# If using Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/umbc-doordash
MONGO_URI=mongodb://localhost:27017/umbc-doordash

# Security
# Generate a random string for this (e.g., using `openssl rand -base64 32`)
JWT_SECRET=your_super_secret_jwt_key_here

# APIs
# Get this from your Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_...
# Optional: Google OAuth Client ID
GOOGLE_CLIENT_ID=your_google_client_id
```

## 4. Database Setup
If you are connecting to a **shared MongoDB Atlas database**, you don't need to do anything else. The data will be there.

If you are using a **local MongoDB** or a **new empty database**, you need to seed it with initial data:

```bash
cd backend
npm run seed
```
*This will create the default users (admin, staff, students) and restaurants.*

## 5. Start the Application
You will need two terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
# In the root directory
npm run dev
```

Access the app at `http://localhost:5173`.
