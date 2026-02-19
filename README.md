# forAbby — Modern Fashion eCommerce

A full-stack, production-ready eCommerce web application for a modern fashion clothing store.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (JSON Web Tokens) + bcrypt |
| State Management | Zustand |
| Payments | Stripe |
| Email | Nodemailer |
| Containerization | Docker + Docker Compose |

---

## Features

### Customer Features
- **Homepage** — Hero slider, featured products, categories, promotions, testimonials
- **Product Listing** — Filter by size, color, price, category; sort by price/newest/popular
- **Product Details** — Image gallery, size/color selector, quantity, add to cart, reviews
- **Shopping Cart** — Drawer UI, quantity update, coupon code support, real-time totals
- **Checkout** — Multi-step: shipping → payment; order summary with discount calculation
- **User Auth** — Register, login, logout, forgot/reset password, email verification
- **Account Dashboard** — Order history, wishlist, shipping addresses

### Admin Features
- **Dashboard** — Revenue stats, order counts, user counts, low stock alerts, top products
- **Product Management** — Add, edit, delete products with images and variants
- **Order Management** — View all orders, update order status inline
- **Customer Management** — View customers, toggle active status, update roles

---

## Quick Start

### Prerequisites
- Node.js 18+, MongoDB, npm

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit both files with your credentials (MongoDB URI, JWT secret, Stripe keys, email settings).

### 3. Seed the Database
```bash
npm run seed
```

**Demo credentials after seeding:**
- Admin: `admin@forabby.com` / `Admin@123456`
- User: `emma@example.com` / `User@123456`

**Demo coupon codes:** `WELCOME20` (20% off), `SUMMER15` (15% off), `FREESHIP` ($10 off)

### 4. Start Development
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

---

## Docker

```bash
docker-compose up -d
docker-compose exec backend npm run seed
```

---

## API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register | Public |
| POST | `/auth/login` | Login | Public |
| GET | `/auth/me` | Current user | Private |
| GET | `/products` | List products (filterable) | Public |
| GET | `/products/featured` | Featured products | Public |
| GET | `/products/:id` | Single product | Public |
| POST | `/products` | Create product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Delete product | Admin |
| GET | `/categories` | All categories | Public |
| GET | `/cart` | Get cart | Private |
| POST | `/cart` | Add to cart | Private |
| PUT | `/cart/:itemId` | Update quantity | Private |
| POST | `/cart/coupon` | Apply coupon | Private |
| POST | `/orders` | Create order | Private |
| GET | `/orders/my-orders` | My orders | Private |
| GET | `/orders` | All orders | Admin |
| PUT | `/orders/:id/status` | Update status | Admin |
| POST | `/payments/create-payment-intent` | Stripe intent | Private |
| POST | `/payments/webhook` | Stripe webhook | Public |
| GET | `/admin/stats` | Dashboard stats | Admin |
| GET | `/reviews/product/:id` | Product reviews | Public |
| POST | `/reviews` | Create review | Private |
| GET | `/users/profile` | My profile | Private |
| POST | `/users/wishlist/:productId` | Toggle wishlist | Private |

### Filter Products (GET /products)
- `category`, `size`, `color`, `minPrice`, `maxPrice`
- `sort`: `newest` | `price-asc` | `price-desc` | `popular` | `rating`
- `search`, `featured`, `newArrival`, `bestSeller`
- `page`, `limit`

---

## Database Models

- **User** — Auth, addresses[], wishlist[], role
- **Product** — Details, variants[] (size+color+stock), images[], SEO
- **Category** — Hierarchy with parent/subcategories
- **Order** — Items, shipping, payment, status history
- **Cart** — Items[], coupon, discount calculations (virtuals)
- **Review** — Rating, verified purchase, auto-updates product rating
- **Coupon** — Percentage/fixed discount, validity, usage limits

---

## Security

- JWT authentication + bcrypt password hashing (12 rounds)
- Rate limiting (100 req/15min general, 20 req/15min auth)
- Helmet.js security headers
- CORS restricted to frontend origin
- Input validation with express-validator
- Environment variables for all secrets

---

## Design

**Color Palette:** Soft beige (`#F5F0E8`), warm white (`#FEFCFA`), charcoal (`#2C2C2C`), gold accent (`#C9A96E`)

**Typography:**
- Logo: *Cormorant Garamond Italic* — luxury, elegant
- Headings: Playfair Display — sophisticated serif
- Body: Poppins — clean modern sans-serif

---

## License

MIT
