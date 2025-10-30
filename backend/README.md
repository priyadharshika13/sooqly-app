# Sooqly API (Swiggy-like)
Run:
```bash
python -m venv .venv && . .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python seed.py
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Auth quick test:
- Register: POST /auth/register {email,password}
- Login: POST /auth/login (form fields: username, password) → Bearer token
Admin user: admin@sooqly.app / Admin@123
```bash
curl -X POST https://sooqly-app.vercel.app//auth/login -d "username=admin@sooqly.app&password=Admin@123"
```
Key endpoints:
- GET /products?fast=&rating_gte=&price_lte=&is_new=&tag=
- GET /offers
- GET /recipes, GET /recipes/{id}/ingredients
- POST /orders (Bearer) → notes includes `Recipe: <title>` if recipe checkout
- Shipping: POST /shipping (Bearer), GET /shipping/{order_id}
- Tracking: POST /tracking (admin), GET /tracking/{order_id} (Bearer)
- Admin CRUD: POST/PUT/DELETE on /products, /offers, /recipes; PUT /orders/{id}/status
