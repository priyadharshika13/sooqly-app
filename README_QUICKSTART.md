# Sooqly Swiggy-like Fullstack (1-Day Build)
## 1) API
```bash
cd backend
python -m venv .venv && . .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python seed.py
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Admin login: `admin@sooqly.app / Admin@123`

## 2) Frontend
```bash
cd frontend
npm i
cp .env.example .env
npm run dev  # http://localhost:5173
```
## What’s inside
- Products / Recipes / Offers CRUD (admin)
- Orders, Shipping, Tracking endpoints
- Filters: `q, category_id, fast, rating_gte, price_lte, is_new, tag`
- Recipe-to-cart and **recipe title printed on bill notes**
- Leaflet map tracking page (OpenStreetMap tiles)
