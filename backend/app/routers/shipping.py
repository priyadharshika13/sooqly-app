from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db, Base, engine
from app import models, schemas
from app.security import get_current_user, require_admin
router = APIRouter()
Base.metadata.create_all(bind=engine)

@router.post("/", response_model=schemas.ShippingOut)
def set_shipping(s: schemas.ShippingIn, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    order = db.get(models.Order, s.order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(403, "Not allowed")
    sh = db.query(models.Shipping).filter_by(order_id=s.order_id).first()
    if not sh:
        sh = models.Shipping(order_id=s.order_id, address_line=s.address_line, city=s.city, pincode=s.pincode, lat=s.lat, lng=s.lng)
        db.add(sh)
    else:
        sh.address_line=s.address_line; sh.city=s.city; sh.pincode=s.pincode; sh.lat=s.lat; sh.lng=s.lng
    db.commit(); db.refresh(sh); return sh

@router.get("/{order_id}", response_model=schemas.ShippingOut)
def get_shipping(order_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    sh = db.query(models.Shipping).filter_by(order_id=order_id).first()
    if not sh: raise HTTPException(404, "Not found")
    return sh
