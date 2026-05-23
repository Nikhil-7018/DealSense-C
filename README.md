# DealSense AI – Smart Price Comparison and Deal Prediction System

Full-stack demo: **React + TypeScript + Tailwind** (Vite), **Express** (MVC), **MySQL**, **Recharts**, and a **linear-regression** price hint (Buy Now vs Wait).

## Folder structure

```
DealSense-C/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # Axios client
│   │   ├── components/
│   │   ├── context/        # Auth (JWT)
│   │   ├── pages/          # Home, Product, Wishlist, Login
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── server/                 # Express backend (MVC)
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql        # Sample products, stores, prices, demo user
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/       # Prediction + chart pivot
│       ├── utils/
│       └── index.js
└── README.md
```

## Prerequisites

- **Node.js** 18+
- **MySQL** 8+ (local or Docker)

## Database setup

1. Create the database and tables:

   ```bash
   mysql -u root -p < server/database/schema.sql
   ```

2. Load sample data (users, stores, products, price history, demo wishlist):

   ```bash
   mysql -u root -p < server/database/seed.sql
   ```

**Demo account (from seed):**

- Email: `demo@dealsense.ai`
- Password: `password123`

If you already ran the seed once, re-run only after a fresh schema, or adjust IDs to avoid duplicates.

## Backend setup

```bash
cd server
cp .env.example .env
# Edit .env: MYSQL_PASSWORD, JWT_SECRET, etc.
npm install
npm run dev
```

Server default: `http://localhost:4000`

### REST APIs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products/search?q=` | Search products by name |
| GET | `/api/prices/:productId` | Product, latest store prices, history for charts |
| GET | `/api/fetch-price/:productId` | Fetch latest price from product URL and store in `prices` |
| GET | `/api/predict/:productId?days=7` | Linear regression forecast + Buy Now / Wait |
| POST | `/api/wishlist/add` | Body: `{ "productId": 1 }` — requires `Authorization: Bearer …` |
| DELETE | `/api/wishlist/remove` | Body: `{ "productId": 1 }` — requires JWT |
| GET | `/api/wishlist` | List wishlist — requires JWT |
| POST | `/api/auth/register` | `{ email, password, name }` |
| POST | `/api/auth/login` | `{ email, password }` |
| GET | `/api/auth/me` | Current user — requires JWT |

## Frontend setup

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

App default: `http://localhost:5173`

Vite proxies `/api` to `http://localhost:4000`, so leave `VITE_API_URL` empty in development.

For a **production** build pointing at a real API host, set `VITE_API_URL` to that origin (no trailing slash).

```bash
npm run build
npm run preview
```

## AI logic (prediction)

- Historical rows are grouped by calendar day; the **minimum** price that day (across stores) models the “best deal” trajectory.
- **Linear regression** fits day-index vs that minimum series.
- **Recommendation:** negative slope → **Wait** (prices trending down); positive slope → **Buy Now** (trending up); near-zero → **Wait** (stable).
- Each `/api/predict/:id` call also inserts a row into `predictions` for auditing.

## Notes

- Prices are stored in INR (₹) in the sample data.
- This project uses demo placeholder URLs by default (`books.toscrape.com`) for safe scraping tests.

## Real-time price fetching integration

1. Add URL column for existing DBs:

   ```sql
   ALTER TABLE products
   ADD COLUMN url VARCHAR(1000) NULL AFTER category;
   ```

2. Update product URLs (use real retailer pages when possible):

   ```sql
   UPDATE products
   SET url = 'https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html'
   WHERE id = 1;
   ```

3. **Live Fetch:** `GET /api/fetch-price/:id` scrapes `products.url` and upserts into `prices` under a fourth store (**Live Fetch**, slug `live-fetch`). That store is created automatically on first use (`INSERT IGNORE`).

4. Fetch and store:

   ```http
   GET /api/fetch-price/1
   ```

5. If you used the temporary `url_price_fetches` table, drop it:

   ```sql
   SOURCE server/database/migrations/004_url_price_fetches.sql;
   ```

6. Latest Live Fetch row (same as other stores — `prices` + `stores`):

   ```sql
   SELECT p.price, p.recorded_at, s.name
   FROM prices p
   JOIN stores s ON s.id = p.store_id
   WHERE p.product_id = 1 AND s.slug = 'live-fetch'
   ORDER BY p.recorded_at DESC, p.id DESC
   LIMIT 1;
   ```
