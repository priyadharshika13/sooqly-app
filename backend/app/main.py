from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.settings import settings
from app.routers import auth, products, offers, recipes, orders, shipping, tracking,admin,payments
from app.db import Base, engine

app = FastAPI(title=settings.APP_NAME)
# origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
origins = [
    "http://localhost:5173",          # Vite dev
    "https://YOUR_VERCEL_URL"         # <-- replace after you get it
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.get("/health")
def health(): return {"status":"ok"}

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(offers.router, prefix="/offers", tags=["offers"])
app.include_router(recipes.router, prefix="/recipes", tags=["recipes"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(shipping.router, prefix="/shipping", tags=["shipping"])
app.include_router(tracking.router, prefix="/tracking", tags=["tracking"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])
