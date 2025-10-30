from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db, Base, engine
from app import models, schemas
from app.security import get_current_user, require_admin
router = APIRouter()
Base.metadata.create_all(bind=engine)

@router.post("/", response_model=schemas.OrderOut)
def place_order(order_in: schemas.OrderCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if not order_in.items:
        raise HTTPException(status_code=400, detail="No items")
    order = models.Order(user_id=user.id, status="PLACED")
    total = 0.0
    for item in order_in.items:
        product = db.get(models.Product, item.product_id)
        if not product or not product.in_stock:
            raise HTTPException(status_code=400, detail=f"Product unavailable: {item.product_id}")
        line_total = product.price * float(item.qty)
        total += line_total
        order.items.append(models.OrderItem(product_id=product.id, qty=item.qty, price=product.price, name=product.name))
    order.total_amount = total
    if order_in.recipe_title:
        order.notes = f"Recipe: {order_in.recipe_title}"
    db.add(order); db.commit(); db.refresh(order)
    return order

@router.get("/", response_model=list[schemas.OrderOut])
def my_orders(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return db.query(models.Order).filter_by(user_id=user.id).order_by(models.Order.id.desc()).all()

@router.get("/all", dependencies=[Depends(require_admin)])
def all_orders(db: Session = Depends(get_db)):
    return [ {"id":o.id,"total_amount":o.total_amount,"status":o.status,"notes":o.notes} for o in db.query(models.Order).order_by(models.Order.id.desc()).all() ]

@router.put("/{oid}/status", dependencies=[Depends(require_admin)])
def update_order_status(oid: int, status: str, db: Session = Depends(get_db)):
    o = db.get(models.Order, oid)
    if not o: raise HTTPException(404, "Not found")
    o.status = status; db.commit(); return {"ok": True}
