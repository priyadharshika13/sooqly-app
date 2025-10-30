from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db, Base, engine
from app import models, schemas
from app.security import get_current_user, require_admin
router = APIRouter()
Base.metadata.create_all(bind=engine)

@router.post("/", dependencies=[Depends(require_admin)])
def push_tracking(t: schemas.TrackingIn, db: Session = Depends(get_db)):
    tr = models.Tracking(order_id=t.order_id, status=t.status, lat=t.lat, lng=t.lng)
    db.add(tr); db.commit(); db.refresh(tr); return {"id": tr.id}

@router.get("/{order_id}", response_model=list[schemas.TrackingOut])
def track_history(order_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return db.query(models.Tracking).filter_by(order_id=order_id).order_by(models.Tracking.id.asc()).all()
