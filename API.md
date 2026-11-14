# API Reference — Nandhini Tex

Interactive HTML documentation is available at **`/api/docs`** when the dev server is running.

This document is a quick reference for all endpoints. For request/response schemas, see the inline JSDoc in each route file under `src/app/api/`.

---

## Base URL

```
Development:  http://localhost:3000/api
Production:   https://yourdomain.com/api
```

All routes return JSON. All `POST`/`PUT` bodies must be `application/json`.

---

## Public endpoints

### Products

#### `GET /api/products`

List published products with optional filters.

| Query param | Type | Description |
|---|---|---|
| `sort` | string | `popularity` (default), `newest`, `price-low`, `price-high`, `rating` |
| `category` | string | Category slug (e.g. `bridal`, `soft-silk`) |
| `limit` | int | Max results (default 20, max 200) |
| `offset` | int | Pagination offset (default 0) |
| `minPrice` | number | Filter by min base price |
| `maxPrice` | number | Filter by max base price |
| `fabric` | string | Filter by fabricType |
| `isNew` | `"true"` | Only new arrivals |
| `isBestseller` | `"true"` | Only bestsellers |
| `q` | string | Full-text search query |

**Response:**
```json
{
  "products": [
    {
      "id": "clx...",
      "slug": "kanchipuram-bridal-silk-saree-red",
      "title": "Kanchipuram Bridal Silk Saree",
      "shortDescription": "...",
      "categoryId": "...",
      "categoryName": "Bridal & Pattu",
      "categorySlug": "bridal",
      "basePrice": 35000,
      "mrp": 38000,
      "discountPct": 8,
      "images": ["https://..."],
      "isBestseller": true,
      "isNew": false,
      "rating": 4.9,
      "reviewCount": 127,
      "inStock": true,
      "fabricType": "Pure Mulberry Silk"
    }
  ],
  "total": 105
}
```

#### `GET /api/products/[slug]`

Get a single product with variants, related products, and reviews.

**Response:**
```json
{
  "product": {
    "id": "...",
    "slug": "...",
    "title": "...",
    "description": "...",
    "basePrice": 35000,
    "mrp": 38000,
    "discountPct": 8,
    "fabricType": "Pure Mulberry Silk",
    "weaveOrigin": "Kanchipuram",
    "weaveDays": 7,
    "zariType": "Real Gold Zari",
    "careInstructions": "...",
    "blouseIncluded": true,
    "blouseLengthM": 0.8,
    "images": ["...", "..."],
    "categoryName": "Bridal & Pattu",
    "categorySlug": "bridal",
    "variants": [
      {
        "id": "...",
        "color": "Red",
        "colorHex": "#C41E3A",
        "size": null,
        "sku": "NT-BRKS-RED-01",
        "stockQty": 3,
        "priceOverride": null
      }
    ],
    "rating": 4.9,
    "reviewCount": 127
  },
  "reviews": [...],
  "related": [...]
}
```

#### `GET /api/categories`

List all categories ordered by `sortOrder`.

```json
{
  "categories": [
    {
      "id": "...",
      "name": "Silk Varieties",
      "slug": "silk-varieties",
      "description": "...",
      "bannerImage": "https://...",
      "productCount": 32
    }
  ]
}
```

#### `GET /api/search?q=<query>`

Full-text search across product titles, descriptions, tags, and fabric types.

```json
{
  "query": "silk",
  "results": [...],
  "total": 87
}
```

### Orders

#### `POST /api/orders`

Place a new order. The server generates an `orderNumber` like `NTX2025XXXXX`.

**Request body:**
```json
{
  "customerName": "Priya Sharma",
  "customerPhone": "9876543210",
  "customerEmail": "priya@example.com",
  "shippingAddress": {
    "name": "Priya Sharma",
    "phone": "9876543210",
    "line1": "12 Anna Nagar",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600040"
  },
  "items": [
    {
      "title": "Kanchipuram Bridal Silk Saree",
      "variant": "Red",
      "qty": 1,
      "price": 35000,
      "image": "https://..."
    }
  ],
  "paymentMethod": "cod",
  "subtotal": 35000,
  "discount": 3500,
  "shippingFee": 0,
  "codSurcharge": 40,
  "grandTotal": 31540,
  "couponCode": "WELCOME10"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "...",
    "orderNumber": "NTX2025123401",
    "status": "pending",
    "grandTotal": 31540,
    "createdAt": "2025-..."
  }
}
```

#### `GET /api/orders/track?q=<orderNumber|phone>`

Track orders by order number or customer phone.

```json
{
  "orders": [
    {
      "orderNumber": "NTX2025123401",
      "status": "shipped",
      "grandTotal": 31540,
      "courier": { "name": "Delhivery", "awb": "...", "trackingUrl": "..." },
      "timeline": [
        { "status": "pending", "timestamp": "...", "note": "Order placed" },
        { "status": "shipped", "timestamp": "...", "note": "Dispatched via Delhivery" }
      ],
      "items": [...]
    }
  ]
}
```

### Reviews

#### `GET /api/reviews?productId=<id>&status=approved`

List reviews for a product (defaults to `approved` only).

#### `POST /api/reviews`

Submit a review (auto-marked `pending` for moderation).

```json
{
  "productId": "clx...",
  "authorName": "Priya",
  "authorCity": "Chennai",
  "rating": 5,
  "title": "Beautiful saree!",
  "body": "The zari work is exquisite..."
}
```

### Coupons

#### `POST /api/coupons/validate`

Validate a coupon code against a cart value.

```json
// Request
{ "code": "WELCOME10", "cartValue": 35000 }

// Response (valid)
{
  "valid": true,
  "coupon": {
    "code": "WELCOME10",
    "type": "percent",
    "value": 10,
    "discountAmount": 3500
  }
}

// Response (invalid)
{
  "valid": false,
  "message": "Coupon expired"
}
```

### Other public endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/testimonials` | Featured testimonials for home page |
| GET | `/api/faqs` | FAQs grouped by category |
| POST | `/api/newsletter` | Subscribe email to newsletter |

---

## Admin endpoints

All admin routes are under `/api/admin/*`. They return `401` if no admin session is present (currently using a simple mode-switch — see `src/lib/store.ts`).

### Products

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/products` | List all products (incl. drafts/archived) |
| POST | `/api/admin/products` | Create a product (auto-unique slug, auto-decrement MRP) |
| PUT | `/api/admin/products/[id]` | Update a product |
| DELETE | `/api/admin/products/[id]` | Delete a product (auto-decrement category `productCount`) |

### Orders

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/orders` | List all orders |
| GET | `/api/admin/orders/[id]` | Get order detail |
| PUT | `/api/admin/orders/[id]` | Update order status, payment status, courier info |

### Inventory

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/inventory` | List all variants with stock levels |
| PUT | `/api/admin/inventory/[variantId]` | Update a single variant's stock |
| POST | `/api/admin/inventory/bulk` | Bulk update stock from CSV-like payload |

### Customers

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/customers` | List customers (auto-derived from orders) |

### Coupons

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/coupons` | List all coupons |
| POST | `/api/admin/coupons` | Create a coupon |
| PUT | `/api/admin/coupons/[id]` | Update a coupon |
| DELETE | `/api/admin/coupons/[id]` | Delete a coupon |

### Categories

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/categories` | List categories |
| POST | `/api/admin/categories` | Create a category |
| PUT | `/api/admin/categories/[id]` | Update a category |
| DELETE | `/api/admin/categories/[id]` | Delete a category (fails if products exist) |

### Reviews

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/reviews` | List all reviews (filterable by status) |
| PUT | `/api/admin/reviews/[id]` | Approve / reject / mark featured |

### FAQs + Testimonials

| Method | Path | Description |
|---|---|---|
| GET / POST | `/api/admin/faqs` | List / create FAQs |
| PUT / DELETE | `/api/admin/faqs/[id]` | Update / delete FAQ |
| GET / POST | `/api/admin/testimonials` | List / create testimonials |
| PUT / DELETE | `/api/admin/testimonials/[id]` | Update / delete testimonial |

### Dashboard

#### `GET /api/dashboard`

Returns aggregated metrics for the admin dashboard.

```json
{
  "summary": {
    "totalRevenue": 458900,
    "totalOrders": 127,
    "totalCustomers": 89,
    "avgOrderValue": 3613,
    "totalProducts": 105,
    "lowStockCount": 12,
    "pendingReviews": 4
  },
  "revenueChart": [
    { "label": "Mon", "revenue": 12340, "orders": 3 }
  ],
  "statusBreakdown": [
    { "status": "delivered", "_count": 89 }
  ],
  "paymentBreakdown": [
    { "paymentMethod": "cod", "_count": 67 }
  ],
  "recentOrders": [...],
  "topProducts": [...]
}
```

---

## System endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | DB ping + uptime + service latencies |
| GET | `/api/status` | Build version + uptime |
| GET | `/api/metrics` | Prometheus-style metrics |
| GET | `/api/docs` | Interactive HTML API reference |

### `/api/health` example

```json
{
  "status": "healthy",
  "uptime": 86423,
  "responseMs": 12,
  "services": {
    "database": { "status": "up", "latencyMs": 5 }
  }
}
```

---

## Error responses

All errors follow the same shape:

```json
{
  "error": "Product not found",
  "code": "NOT_FOUND",
  "details": { "id": "clx..." }
}
```

| HTTP status | When |
|---|---|
| 400 | Invalid input (missing required field, bad format) |
| 401 | Admin endpoint accessed without admin session |
| 404 | Resource not found |
| 409 | Conflict (duplicate slug, coupon already used) |
| 500 | Server error (Prisma failure, unexpected exception) |

---

## Rate limiting

Not currently implemented. For production, add a rate limiter (e.g. `@upstash/ratelimit` or Nginx `limit_req`) on:
- `POST /api/orders`
- `POST /api/reviews`
- `POST /api/newsletter`
- `POST /api/coupons/validate`
