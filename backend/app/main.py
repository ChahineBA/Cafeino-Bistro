"""
Cafeino Bistro POS - Main FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .config import settings
from .database import database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - handles startup and shutdown"""
    # Startup
    await database.connect_db()
    yield
    # Shutdown
    await database.close_db()


# Create FastAPI application
app = FastAPI(
    title="Cafeino Bistro POS API",
    description="Point of Sale system for Cafeino Bistro coffee shop",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Cafeino Bistro POS API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# Import and include routers
from .routers import auth, orders, products, services, reports, users, chatbot

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])