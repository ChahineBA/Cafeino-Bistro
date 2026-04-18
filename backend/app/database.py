"""
MongoDB database connection setup using Motor (async driver)
Provides database instance and collection accessors
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from .config import settings


class Database:
    """Database connection manager"""
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    
    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB Atlas"""
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
            cls.db = cls.client[settings.DATABASE_NAME]
            
            # Test the connection
            await cls.client.admin.command('ping')
            print(f"✅ Connected to MongoDB Atlas: {settings.DATABASE_NAME}")
        except Exception as e:
            print(f"❌ Error connecting to MongoDB: {e}")
            raise
    
    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            print("🔌 MongoDB connection closed")
    
    @classmethod
    def get_db(cls) -> AsyncIOMotorDatabase:
        """Get database instance"""
        if cls.db is None:
            raise Exception("Database not initialized. Call connect_db() first.")
        return cls.db


# Database instance
database = Database()


# Collection getters
def get_users_collection():
    """Get users collection"""
    return database.get_db()["users"]


def get_products_collection():
    """Get products collection"""
    return database.get_db()["products"]


def get_orders_collection():
    """Get orders collection"""
    return database.get_db()["orders"]


def get_services_collection():
    """Get service records collection"""
    return database.get_db()["services"]
