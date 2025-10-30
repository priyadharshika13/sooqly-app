import hmac, hashlib, base64
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
import razorpay
from app.settings import settings
from app.db import get_db
from app.security import get_current_user
from app import models

router = APIRouter()

class CreateOrderIn(BaseModel):
    amount: float  # INR
    currency: str = "INR"
    receipt: str | None = None

@router.get("/key")
def get_key():
    return {"key_id": settings.RAZORPAY_KEY_ID}

@router.post("/order")
def create_order(payload: CreateOrderIn, user=Depends(get_current_user), db: Session = Depends(get_db)):
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    paise = int(round(payload.amount * 100))
    order = client.order.create(dict(amount=paise, currency=payload.currency, receipt=payload.receipt or f"rcpt_{user.id}"))
    return order

# Optional: verify payment signature (frontend success callback posts here)
class VerifyIn(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@router.post("/verify")
def verify_payment(v: VerifyIn):
    body = f"{v.razorpay_order_id}|{v.razorpay_payment_id}"
    expected = hmac.new(settings.RAZORPAY_KEY_SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()
    if expected != v.razorpay_signature:
        raise HTTPException(400, "Signature mismatch")
    return {"ok": True}

# Webhook endpoint (configure on Razorpay dashboard)
@router.post("/webhook")
async def webhook(request: Request):
    body = await request.body()
    received_sig = request.headers.get("x-razorpay-signature", "")
    computed_sig = hmac.new(settings.WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(received_sig, computed_sig):
        raise HTTPException(400, "Invalid webhook signature")
    # TODO: parse event and mark order as PAID in DB
    return {"ok": True}
