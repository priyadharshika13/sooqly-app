from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db, Base, engine
from app import models, schemas
from app.security import require_admin
router = APIRouter()
Base.metadata.create_all(bind=engine)

@router.get("/", response_model=list[schemas.OfferOut])
def list_offers(db: Session = Depends(get_db)):
    return db.query(models.Offer).filter(models.Offer.active==True).order_by(models.Offer.id.desc()).all()

@router.post("/", dependencies=[Depends(require_admin)])
def create_offer(title: str, description: str = "", offer_pct: int = 0, banner_image: str | None = None, active: bool = True, db: Session = Depends(get_db)):
    o = models.Offer(title=title, description=description, offer_pct=offer_pct, banner_image=banner_image, active=active)
    db.add(o); db.commit(); db.refresh(o); return {"id": o.id}

@router.put("/{oid}", dependencies=[Depends(require_admin)])
def update_offer(oid: int, title: str | None = None, description: str | None = None, offer_pct: int | None = None, banner_image: str | None = None, active: bool | None = None, db: Session = Depends(get_db)):
    o = db.get(models.Offer, oid)
    if not o: raise HTTPException(404, "Not found")
    if title is not None: o.title = title
    if description is not None: o.description = description
    if offer_pct is not None: o.offer_pct = offer_pct
    if banner_image is not None: o.banner_image = banner_image
    if active is not None: o.active = active
    db.commit(); db.refresh(o); return {"ok": True}

@router.delete("/{oid}", dependencies=[Depends(require_admin)])
def delete_offer(oid: int, db: Session = Depends(get_db)):
    o = db.get(models.Offer, oid)
    if not o: raise HTTPException(404, "Not found")
    db.delete(o); db.commit(); return {"ok": True}
