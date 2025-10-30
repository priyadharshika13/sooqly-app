from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db, Base, engine
from app import models, schemas
from app.security import require_admin
router = APIRouter()
Base.metadata.create_all(bind=engine)

@router.get("/", response_model=list[schemas.RecipeOut])
def list_recipes(db: Session = Depends(get_db)):
    return db.query(models.Recipe).order_by(models.Recipe.id.desc()).all()

@router.post("/", dependencies=[Depends(require_admin)])
def create_recipe(title: str, description: str = "", image_url: str | None = None, tags: str = "", db: Session = Depends(get_db)):
    r = models.Recipe(title=title, description=description, image_url=image_url, tags=tags)
    db.add(r); db.commit(); db.refresh(r); return {"id": r.id}

@router.put("/{rid}", dependencies=[Depends(require_admin)])
def update_recipe(rid: int, title: str | None = None, description: str | None = None, image_url: str | None = None, tags: str | None = None, db: Session = Depends(get_db)):
    r = db.get(models.Recipe, rid)
    if not r: raise HTTPException(404, "Not found")
    if title is not None: r.title = title
    if description is not None: r.description = description
    if image_url is not None: r.image_url = image_url
    if tags is not None: r.tags = tags
    db.commit(); db.refresh(r); return {"ok": True}

@router.delete("/{rid}", dependencies=[Depends(require_admin)])
def delete_recipe(rid: int, db: Session = Depends(get_db)):
    r = db.get(models.Recipe, rid)
    if not r: raise HTTPException(404, "Not found")
    db.delete(r); db.commit(); return {"ok": True}

@router.get("/{recipe_id}/ingredients")
def recipe_ingredients(recipe_id: int, db: Session = Depends(get_db)):
    rec = db.get(models.Recipe, recipe_id)
    if not rec: return {"items": []}
    # MVP: choose 6 products
    products = db.query(models.Product).filter(models.Product.in_stock==True).limit(6).all()
    items = [{"product_id": p.id, "name": p.name, "price": p.price, "qty": 1} for p in products]
    return {"items": items, "recipe_title": rec.title}
