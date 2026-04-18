"""
Seed script for Cafeino Bistro POS
Creates initial data for testing and development
"""
import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from app.utils.auth import get_password_hash
from app.config import settings


async def seed_database():
    """Seed the database with initial data"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    print("🌱 Starting database seeding...")
    
    # Clear existing data (optional - comment out if you want to keep existing data)
    print("🗑️  Clearing existing data...")
    await db.users.delete_many({})
    await db.products.delete_many({})
    await db.orders.delete_many({})
    await db.services.delete_many({})
    
    # Create users
    print("👥 Creating users...")
    users = [
        {
            "email": "admin@cafeino.com",
            "full_name": "Admin User",
            "hashed_password": get_password_hash("admin123"),
            "role": "admin",
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "email": "waiter1@cafeino.com",
            "full_name": "John Doe",
            "hashed_password": get_password_hash("waiter123"),
            "role": "waiter",
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "email": "waiter2@cafeino.com",
            "full_name": "Jane Smith",
            "hashed_password": get_password_hash("waiter123"),
            "role": "waiter",
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    result = await db.users.insert_many(users)
    print(f"✅ Created {len(result.inserted_ids)} users")
    
    # Create products
    print("☕ Creating products...")
    products = [
        # Coffee
        {
            "name": "Espresso",
            "description": "Rich and bold espresso shot",
            "category": "coffee",
            "price": 2.50,
            "image_url": None,
            "is_available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Cappuccino",
            "description": "Espresso with steamed milk and foam",
            "category": "coffee",
            "price": 3.50,
            "image_url": None,
            "is_available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Latte",
            "description": "Smooth espresso with steamed milk",
            "category": "coffee",
            "price": 4.00,
            "image_url": None,
            "is_available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Americano",
            "description": "Espresso with hot water",
            "category": "coffee",
            "price": 3.00,
            "image_url": None,
            "is_available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Mocha",
            "description": "Espresso with chocolate and steamed milk",
            "category": "coffee",
            "price": 4.50,
            "image_url": None,
            "is_available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        # Pastries
        {
            "name": "Croissant",
            "description": "Buttery French pastry",
            "category": "pastries",
            "price": 3.00,
            "image_url": None,
            "is_available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Chocolate Muffin",
            "description": "Moist chocolate chip muffin",
            "category": "pastries",
            "price": 3.50,
            "image_url": None,
            "is_available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Blueberry Scone",
            "description": "Fresh blueberry scone",
            "category": "pastries",
            "price": 3.25,
            "image_url": None,
            "is_available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        # Sandwiches
        {
            "name": "Turkey & Cheese Sandwich",
            "description": "Fresh turkey with cheese on whole wheat",
            "category": "sandwiches",
            "price": 7.50,
            "image_url": None,
            "is_available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Veggie Panini",
            "description": "Grilled vegetables with mozzarella",
            "category": "sandwiches",
            "price": 6.50,
            "image_url": None,
            "is_available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        # Beverages
        {
            "name": "Orange Juice",
            "description": "Freshly squeezed orange juice",
            "category": "beverages",
            "price": 3.50,
            "image_url": None,
            "is_available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Iced Tea",
            "description": "Refreshing iced tea",
            "category": "beverages",
            "price": 2.50,
            "image_url": None,
            "is_available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    result = await db.products.insert_many(products)
    print(f"✅ Created {len(result.inserted_ids)} products")
    
    print("✨ Database seeding completed successfully!")
    print("\n📝 Test Credentials:")
    print("   Admin: admin@cafeino.com / admin123")
    print("   Waiter 1: waiter1@cafeino.com / waiter123")
    print("   Waiter 2: waiter2@cafeino.com / waiter123")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
