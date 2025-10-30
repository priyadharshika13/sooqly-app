from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import models
from app.security import require_admin

router = APIRouter()

@router.post("/products")
def create_product(name: str, price: float, category: str = "General", in_stock: bool = True,
                   db: Session = Depends(get_db), admin=Depends(require_admin)):
    p = models.Product(name=name, price=price, category=category, in_stock=in_stock)
    db.add(p); db.commit(); db.refresh(p)
    return {"id": p.id}

@router.put("/products/{product_id}")
def update_product(product_id: int, name: str | None = None, price: float | None = None,
                   category: str | None = None, in_stock: bool | None = None,
                   db: Session = Depends(get_db), admin=Depends(require_admin)):
    p = db.get(models.Product, product_id)
    if not p: raise HTTPException(404, "Not found")
    if name is not None: p.name = name
    if price is not None: p.price = price
    if category is not None: p.category = category
    if in_stock is not None: p.in_stock = in_stock
    db.commit(); db.refresh(p)
    return {"ok": True}

@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    p = db.get(models.Product, product_id)
    if not p: raise HTTPException(404, "Not found")
    db.delete(p); db.commit()
    return {"ok": True}
