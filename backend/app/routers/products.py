from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db, Base, engine
from app import models, schemas
from app.security import require_admin
router = APIRouter()
Base.metadata.create_all(bind=engine)

@router.get("/", response_model=list[schemas.ProductOut])
def list_products(
    q: str | None = Query(None),
    category_id: int | None = Query(None),
    fast: bool | None = Query(None),
    rating_gte: float | None = Query(None),
    price_lte: float | None = Query(None),
    is_new: bool | None = Query(None),
    tag: str | None = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Product).filter(models.Product.in_stock == True)
    if q: query = query.filter(models.Product.name.ilike(f"%{q}%"))
    if category_id: query = query.filter(models.Product.category_id == category_id)
    if fast: query = query.filter(models.Product.is_fast_delivery == True)
    if rating_gte: query = query.filter(models.Product.rating >= rating_gte)
    if price_lte: query = query.filter(models.Product.price <= price_lte)
    if is_new: query = query.filter(models.Product.is_new == True)
    if tag: query = query.filter(models.Product.tags.ilike(f"%{tag}%"))
    return query.order_by(models.Product.id.desc()).all()

@router.post("/", dependencies=[Depends(require_admin)])
def create_product(name: str, price: float, category_id: int, rating: float = 4.0, is_fast_delivery: bool = False, offer_pct: int = 0, image_url: str | None = None,
                   in_stock: bool=True, is_new: bool=False, tags: str = "", db: Session = Depends(get_db)):
    p = models.Product(name=name, price=price, category_id=category_id, rating=rating, is_fast_delivery=is_fast_delivery, offer_pct=offer_pct, image_url=image_url, in_stock=in_stock, is_new=is_new, tags=tags)
    db.add(p); db.commit(); db.refresh(p); return {"id": p.id}

@router.put("/{pid}", dependencies=[Depends(require_admin)])
def update_product(pid: int, name: str | None = None, price: float | None = None, category_id: int | None = None, rating: float | None = None,
                   is_fast_delivery: bool | None = None, offer_pct: int | None = None, image_url: str | None = None,
                   in_stock: bool | None = None, is_new: bool | None = None, tags: str | None = None, db: Session = Depends(get_db)):
    p = db.get(models.Product, pid)
    if not p: raise HTTPException(404, "Not found")
    if name is not None: p.name = name
    if price is not None: p.price = price
    if category_id is not None: p.category_id = category_id
    if rating is not None: p.rating = rating
    if is_fast_delivery is not None: p.is_fast_delivery = is_fast_delivery
    if offer_pct is not None: p.offer_pct = offer_pct
    if image_url is not None: p.image_url = image_url
    if in_stock is not None: p.in_stock = in_stock
    if is_new is not None: p.is_new = is_new
    if tags is not None: p.tags = tags
    db.commit(); db.refresh(p); return {"ok": True}

@router.delete("/{pid}", dependencies=[Depends(require_admin)])
def delete_product(pid: int, db: Session = Depends(get_db)):
    p = db.get(models.Product, pid)
    if not p: raise HTTPException(404, "Not found")
    db.delete(p); db.commit(); return {"ok": True}
