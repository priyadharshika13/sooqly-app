from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserCreate(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    password: str
    mobile: Optional[str] = None

    

class ProductOut(BaseModel):
    id: int
    name: str
    price: float
    image_url: str | None = None
    rating: float
    is_fast_delivery: bool
    offer_pct: int
    in_stock: bool
    is_new: bool
    category_id: int | None = None
    tags: str | None = ""
    class Config: from_attributes = True

class OfferOut(BaseModel):
    id: int
    title: str
    description: str | None = None
    banner_image: str | None = None
    offer_pct: int
    active: bool
    class Config: from_attributes = True

class RecipeOut(BaseModel):
    id: int
    title: str
    description: str | None = None
    image_url: str | None = None
    tags: str | None = ""
    class Config: from_attributes = True

class OrderItemIn(BaseModel):
    product_id: int
    qty: float = 1.0

class OrderCreate(BaseModel):
    items: List[OrderItemIn]
    recipe_title: str | None = None  # if items came from recipe

class OrderOut(BaseModel):
    id: int
    total_amount: float
    status: str
    notes: str | None = None
    class Config: from_attributes = True

class ShippingIn(BaseModel):
    order_id: int
    address_line: str
    city: str
    pincode: str
    lat: float | None = None
    lng: float | None = None

class ShippingOut(BaseModel):
    id: int
    order_id: int
    address_line: str
    city: str
    pincode: str
    lat: float | None = None
    lng: float | None = None
    class Config: from_attributes = True

class TrackingIn(BaseModel):
    order_id: int
    status: str
    lat: float | None = None
    lng: float | None = None

class TrackingOut(BaseModel):
    id: int
    order_id: int
    status: str
    lat: float | None = None
    lng: float | None = None
    class Config: from_attributes = True
