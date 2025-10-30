from app.db import SessionLocal, Base, engine
from app import models
from passlib.hash import bcrypt
# OLD
# from passlib.hash import bcrypt
# ...
# hashed_password=bcrypt.hash("Admin@123")

# NEW
from passlib.hash import pbkdf2_sha256
# ...

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # admin
    if not db.query(models.User).filter_by(email="admin@sooqly.app").first():
        db.add(models.User(email="admin@sooqly.app", full_name="Admin", role="admin", hashed_password = pbkdf2_sha256.hash("Admin@123", rounds=29000)
))
    # categories
    cat_map = {}
    for name, slug in [("All","all"),("Fishes","fishes"),("Spices","spices"),("Add-ons","addons")]:
        c = db.query(models.Category).filter_by(slug=slug).first()
        if not c:
            c = models.Category(name=name, slug=slug); db.add(c); db.flush()
        cat_map[slug] = c
    # products
    if db.query(models.Product).count()==0:
        sample = [
            ("Fresh Rohu (1kg)", 299, "fishes", True, 4.3, 10, "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=60","fish,protein"),
            ("Salmon Fillet (500g)", 449, "fishes", True, 4.7, 0, "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=60","omega,grill"),
            ("Turmeric Powder (200g)", 89, "spices", False, 4.2, 5, "https://images.unsplash.com/photo-1604908554165-9b7b2df4cf0d?auto=format&fit=crop&w=600&q=60","immunity,spice"),
            ("Cumin Seeds (100g)", 75, "spices", False, 4.5, 0, "https://images.unsplash.com/photo-1615484477778-795c9d615696?auto=format&fit=crop&w=600&q=60","spice,jeera"),
            ("Lemon", 8, "addons", True, 4.1, 0, "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=60","vitc,addon"),
        ]
        for n, price, cat, fast, rating, offer, img, tags in sample:
            db.add(models.Product(name=n, price=price, category_id=cat_map[cat].id, is_fast_delivery=fast, rating=rating, offer_pct=offer, image_url=img, is_new=False, tags=tags))
    # offers
    if db.query(models.Offer).count()==0:
        db.add(models.Offer(title="Festive Mega Sale", description="Up to 30% off on fish combos", banner_image="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1400&q=60", offer_pct=30, active=True))
    # recipes
    if db.query(models.Recipe).count()==0:
        db.add(models.Recipe(title="Fish Fry Combo", description="Classic South Indian fish fry ingredients.", tags="fish,spicy"))
        db.add(models.Recipe(title="Jeera Rice Kit", description="Simple cumin rice combo pack.", tags="veg,spice"))
    db.commit(); db.close(); print("Seed complete.")
if __name__ == "__main__":
    seed()
