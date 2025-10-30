from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.security import get_current_user
from app.settings import settings
import os

router = APIRouter()

class PayIn(BaseModel):
    provider: str   # "stripe" or "hyperpay"
    amount: int     # in minor units (e.g., paise)
    currency: str = "INR"
    order_id: int

@router.post("/create-intent")
def create_intent(p: PayIn, user=Depends(get_current_user)):
    if p.provider.lower() == "stripe":
        import stripe
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        if not stripe.api_key:
            raise HTTPException(500, "Stripe key missing")
        intent = stripe.PaymentIntent.create(
            amount=p.amount,
            currency=p.currency.lower(),
            metadata={"order_id": str(p.order_id), "user": user.email},
            automatic_payment_methods={"enabled": True}
        )
        return {"provider":"stripe", "client_secret": intent.client_secret}

    elif p.provider.lower() == "hyperpay":
        # Minimal stub for demo: normally you'd call HyperPay/OPP init and return checkoutId
        # Replace this section with a real HTTPS call using your credentials.
        demo_checkout_id = "stubbed-checkout-id-123"
        return {"provider":"hyperpay", "checkout_id": demo_checkout_id, "note":"Replace with real HyperPay init"}

    else:
        raise HTTPException(400, "Unknown provider")
