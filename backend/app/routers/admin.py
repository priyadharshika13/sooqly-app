from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import User, Order
from app.security import require_admin

router = APIRouter()

@router.get("/users", dependencies=[Depends(require_admin)])
def list_users(db: Session = Depends(get_db)):
    rows = db.query(User).order_by(User.id.desc()).all()
    return [
        {"id":u.id, "email":u.email, "full_name":u.full_name, "mobile":u.mobile, "role":u.role}
        for u in rows
    ]

@router.get("/orders", dependencies=[Depends(require_admin)])
def list_all_orders(db: Session = Depends(get_db)):
    rows = db.query(Order).order_by(Order.id.desc()).all()
    return [
        {"id":o.id, "user_id":o.user_id, "status":o.status, "total_amount":o.total_amount, "notes":o.notes}
        for o in rows
    ]
