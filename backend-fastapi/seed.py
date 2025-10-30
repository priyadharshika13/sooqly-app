from app.db import SessionLocal, Base, engine
from app import models
from sqlalchemy.orm import Session
from passlib.hash import bcrypt

def seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    if not db.query(models.User).filter_by(email="admin@sooqly.app").first():
        admin = models.User(
            email="admin@sooqly.app",
            full_name="Admin",
            role="admin",
            hashed_password=bcrypt.hash("Admin@123")
        )
        db.add(admin)
    if db.query(models.Product).count() == 0:
        items = [
            {"name":"Fresh Rohu (1kg)","price":299.0,"category":"Fishes"},
            {"name":"Salmon Fillet (500g)","price":449.0,"category":"Fishes"},
            {"name":"Turmeric Powder (200g)","price":89.0,"category":"Spices"},
            {"name":"Cumin Seeds (100g)","price":75.0,"category":"Spices"},
            {"name":"Lemon","price":8.0,"category":"Add-ons"}
        ]
        for it in items:
            db.add(models.Product(**it, in_stock=True))
    db.commit()
    db.close()
    print("Seed complete. Admin user: admin@sooqly.app / Admin@123")
if __name__ == "__main__":
    seed()
