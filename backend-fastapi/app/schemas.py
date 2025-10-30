from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserCreate(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProductOut(BaseModel):
    id: int
    name: str
    price: float
    category: str | None = None
    in_stock: bool
    class Config:
        from_attributes = True

class OrderItemIn(BaseModel):
    product_id: int
    qty: int

class OrderCreate(BaseModel):
    items: List[OrderItemIn]

class OrderOut(BaseModel):
    id: int
    total_amount: float
    status: str
    class Config:
        from_attributes = True
