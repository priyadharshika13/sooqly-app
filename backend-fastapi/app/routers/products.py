from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db import get_db, Base, engine
from app import models, schemas

router = APIRouter()
Base.metadata.create_all(bind=engine)

@router.get("/", response_model=list[schemas.ProductOut])
def list_products(q: str | None = Query(None), category: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Product).filter(models.Product.in_stock == True)
    if q:
        query = query.filter(models.Product.name.ilike(f"%{q}%"))
    if category:
        query = query.filter(models.Product.category == category)
    return query.order_by(models.Product.id.desc()).all()
