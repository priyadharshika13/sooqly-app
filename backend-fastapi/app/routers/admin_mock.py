from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import models
router = APIRouter()
@router.post("/mock/add-product")
def add_product(name: str, price: float, category: str = "General", db: Session = Depends(get_db)):
    p = models.Product(name=name, price=price, category=category, in_stock=True)
    db.add(p); db.commit(); db.refresh(p)
    return {"ok": True, "id": p.id}
