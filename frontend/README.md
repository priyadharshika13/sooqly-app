# Sooqly Frontend (Swiggy-like)
Run:
```bash
npm i
cp .env.example .env
npm run dev
```
Set `VITE_API` to your API (default https://sooqly-app.vercel.app).
Features:
- Banner, Offers, Tabs, Filter chips
- Product grid with rating/fast/new/offer badges
- Recipes row: add ingredients, buy recipe (cart)
- Sticky cart bar
- Map tracking (Leaflet + OSM). Enter order id to see latest tracking position.
