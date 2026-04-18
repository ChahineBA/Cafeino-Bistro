# Cafeino Bistro POS - Backend

FastAPI backend for the Cafeino Bistro Point of Sale system.

## Features

- 🔐 JWT-based authentication
- 👥 Role-based access control (Admin/Waiter)
- 📦 Product management
- 🛒 Order management
- ⏰ Service tracking (clock in/out)
- 📊 Analytics and reporting
- 🗄️ MongoDB Atlas cloud database
- 🕷️ Web scraper for menu import from cafeinobistro.com

## Tech Stack

- **FastAPI** - Modern Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing

## Prerequisites

- Python 3.9+
- MongoDB Atlas account (or local MongoDB)
- pip or poetry for package management

## Installation

1. **Create a virtual environment:**

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Set up environment variables:**

Create a `.env` file in the backend directory:

```env
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=cafeino_pos
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**Getting MongoDB Atlas Connection String:**
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<cluster>` with your credentials

4. **Seed the database:**

```bash
cd app
python seed.py
```

This will create:
- Admin user: `admin@cafeino.com` / `admin123`
- Waiter users: `waiter1@cafeino.com` / `waiter123`
- Sample products (coffee, pastries, sandwiches, beverages)

## Running the Server

**Development mode with auto-reload:**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/register` - Register new user (Admin only)
- `GET /api/auth/me` - Get current user info

### Products (`/api/products`)

- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/{id}` - Update product (Admin only)
- `DELETE /api/products/{id}` - Delete product (Admin only)

### Orders (`/api/orders`)

- `GET /api/orders` - List orders (filtered by role)
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}` - Update order status
- `DELETE /api/orders/{id}` - Cancel order

### Services (`/api/services`)

- `POST /api/services/clock-in` - Clock in
- `POST /api/services/clock-out` - Clock out
- `GET /api/services` - Get service records
- `GET /api/services/date/{date}` - Get services by date (Admin only)
- `GET /api/services/active` - Get active service

### Reports (`/api/reports`)

All report endpoints are Admin only:

- `GET /api/reports/revenue` - Revenue report by date range
- `GET /api/reports/orders` - Order statistics by date
- `GET /api/reports/waiters` - Waiter performance metrics
- `GET /api/reports/top-products` - Top selling products

## Authentication

All endpoints (except login) require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🐳 Docker Support

You can run the entire system using Docker:

1. **Build and run with Docker Compose:**
```bash
docker-compose up --build
```

The system will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- MongoDB: mongodb://localhost:27017

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── database.py          # MongoDB connection
│   ├── seed.py              # Database seeding script
│   ├── models/              # MongoDB document models
│   ├── schemas/             # Pydantic validation schemas
│   ├── routers/             # API route handlers
│   └── utils/               # Utility functions
├── requirements.txt
├── .env.example
├── Dockerfile
└── README.md
```

## Troubleshooting

**MongoDB Connection Issues:**
- Verify your MongoDB Atlas connection string
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure database user has proper permissions

**Import Errors:**
- Make sure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

**Authentication Errors:**
- Check if JWT token is properly included in headers
- Verify token hasn't expired (24 hours default)

**Scraper Issues:**
- Install scraper dependencies: `pip install beautifulsoup4 requests`
- Check internet connection
- Verify website is accessible

## License

Proprietary - Cafeino Bistro
