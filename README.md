
# Consumer Behaviour & Demand Forecasting System

Role-based retail management platform with JWT auth, inventory, checkout, CSV ingestion, and analytics.


- **Frontend:** React (Vite), Tailwind CSS, Recharts, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Auth:** JWT, bcrypt, role-based (Admin / Seller)

## Images
### Sign-in Page
<img width="624" height="688" alt="image" src="https://github.com/user-attachments/assets/d2a7a5e9-e7f0-4d5c-ae89-769b65f11e21" />

### Dashboard
<img width="817" height="490" alt="image" src="https://github.com/user-attachments/assets/98889387-2053-4d1d-9f7e-0ddc99a29708" />
<img width="978" height="552" alt="image" src="https://github.com/user-attachments/assets/6fa1e695-a940-47fa-9417-b188426252b3" />

### Checkout Page
<img width="669" height="790" alt="image" src="https://github.com/user-attachments/assets/2d18f8da-b7f9-451d-9894-de6f8b32e0f9" />

### Data Ingestion Page
<img width="980" height="414" alt="image" src="https://github.com/user-attachments/assets/bb310f82-24fa-4ddc-8a2f-8d051e9dc372" />

## Project structure
```
pbl_project/
├── backend/
│   ├── database/
│   │   └── schema.sql          # MySQL schema
│   ├── src/
│   │   ├── config/             # DB, app config
│   │   ├── controllers/        # Auth, analytics, checkout, ingestion
│   │   ├── middleware/        # Auth, validation
│   │   ├── routes/             # API routes
│   │   ├── services/           # Checkout transaction logic
│   │   ├── scripts/
│   │   │   └── seedAdmin.js    # Seed default admin
│   │   ├── app.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/            # AuthContext
│   │   ├── layouts/
│   │   ├── pages/              # Login, Dashboard, DataIngestion, Checkout, Forgot/Reset password
│   │   ├── services/           # API client
│   │   └── utils/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── docs/
    └── API.md                  # API reference
```

## Setup

### 1. Database

- Install MySQL and create the database:

```bash
mysql -u root -p < backend/database/schema.sql
```

Or run the contents of `backend/database/schema.sql` in your MySQL client.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DB_*, JWT_SECRET, FRONTEND_URL
npm install
node src/scripts/seedAdmin.js   # Creates admin@retail.com / Admin@123
npm run dev
```

Server runs at `https://intelli-retail.onrender.com`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```
App runs at `https://intelli-retail.vercel.app` and proxies `/api` to the backend.

## Default login

- **Email:** admin@retail.com  
- **Password:** Admin@123  
- **Role:** Admin (select in login form)

## Features

- **Auth:** Login with role (Admin/Seller), forgot password, reset by token, JWT protection
- **Dashboard:** KPIs (revenue, orders, customers, low stock, expiry), pie (categories), bar (sales by day), line (revenue trend)
- **Data ingestion:** CSV upload for customers, inventory, sales with validation and summary
- **Checkout:** Customer search/new, product search, cart, live subtotal/tax/total, place order with transaction and stock deduction

## API overview

See [docs/API.md](docs/API.md) for full endpoint list and request/response shapes.

## Security

- Passwords hashed with bcrypt
- JWT for sessions; protected and role-checked routes
- Input validation (express-validator)
- Prepared statements for MySQL (SQL injection protection)

## NEXT MODULES
 
 ### CONSUMER BEHAVIOUR ANALYTICS 
 - Customer Profiling & RFM analysis
 - Customer Segmentation
 - Behavioral Patterns

### DEMAND FORECASTING 
 - Product-level
 - Category-level
 - Store-level
 - Region-level
### INVENTORY & SUPPLY SIGNALS
### MARKET BASKET & PRODUCT INSIGHTS
### RECOMMENDATION ENGINE












