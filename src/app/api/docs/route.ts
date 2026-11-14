import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/docs — API documentation (OpenAPI-style JSON listing all routes)
// SECURITY: full API surface (including admin endpoints) is gated behind admin auth
// to prevent attackers from enumerating the attack surface.
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized — admin session required", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }
  const docs = {
    openapi: "3.0.0",
    info: {
      title: "Nandhini Tex API",
      version: "1.0.0",
      description:
        "REST API for the Nandhini Tex handwoven saree e-commerce platform. Includes storefront, admin, inventory, health, and metrics endpoints.",
      contact: {
        name: "Nandhini Tex",
        url: "https://nandhinitex.com",
        email: "hello@nandhinitex.com",
        phone: "+91 76048 11838",
      },
    },
    servers: [
      { url: "/", description: "Current server" },
    ],
    paths: {
      // ---- System ----
      "/api/health": {
        get: {
          summary: "Health check (liveness + readiness)",
          description: "Returns 200 if app is alive and database is reachable. Use ?check=liveness for a lightweight check without DB.",
          tags: ["System"],
          parameters: [
            { name: "check", in: "query", schema: { type: "string", enum: ["liveness", "readiness"] }, description: "Type of health check" },
          ],
          responses: {
            "200": { description: "Service is healthy" },
            "503": { description: "Service is unhealthy (database unreachable)" },
          },
        },
      },
      "/api/status": {
        get: {
          summary: "API status and version info",
          tags: ["System"],
          responses: { "200": { description: "Service status" } },
        },
      },
      "/api/metrics": {
        get: {
          summary: "Business and operational metrics",
          tags: ["System"],
          responses: { "200": { description: "Metrics object" } },
        },
      },
      "/api/docs": {
        get: {
          summary: "API documentation (this endpoint)",
          tags: ["System"],
          responses: { "200": { description: "OpenAPI-style spec" } },
        },
      },
      // ---- Storefront ----
      "/api/categories": {
        get: { summary: "List all categories", tags: ["Storefront"], responses: { "200": { description: "Array of categories" } } },
      },
      "/api/products": {
        get: {
          summary: "List products with filters",
          tags: ["Storefront"],
          parameters: [
            { name: "category", in: "query", schema: { type: "string" }, description: "Category slug" },
            { name: "q", in: "query", schema: { type: "string" }, description: "Search query" },
            { name: "sort", in: "query", schema: { type: "string", enum: ["popularity", "newest", "price-low", "price-high", "rating"] } },
            { name: "minPrice", in: "query", schema: { type: "number" } },
            { name: "maxPrice", in: "query", schema: { type: "number" } },
            { name: "fabric", in: "query", schema: { type: "string" } },
            { name: "isNew", in: "query", schema: { type: "boolean" } },
            { name: "isBestseller", in: "query", schema: { type: "boolean" } },
            { name: "isFeatured", in: "query", schema: { type: "boolean" } },
            { name: "limit", in: "query", schema: { type: "integer", default: 100, maximum: 200 } },
          ],
          responses: { "200": { description: "Array of products" } },
        },
      },
      "/api/products/{slug}": {
        get: { summary: "Get product by slug (with reviews + related)", tags: ["Storefront"], responses: { "200": { description: "Product detail" }, "404": { description: "Not found" } } },
      },
      "/api/search": {
        get: { summary: "Full-text search across products", tags: ["Storefront"], responses: { "200": { description: "Search results" } } },
      },
      "/api/reviews": {
        get: { summary: "List reviews for a product", tags: ["Storefront"], parameters: [{ name: "productId", in: "query", required: true, schema: { type: "string" } }], responses: { "200": { description: "Array of reviews" } } },
        post: { summary: "Submit a new review (gated to delivered orders)", tags: ["Storefront"], responses: { "201": { description: "Review created (pending approval)" } } },
      },
      "/api/testimonials": {
        get: { summary: "List featured testimonials", tags: ["Storefront"], responses: { "200": { description: "Array of testimonials" } } },
      },
      "/api/faqs": {
        get: { summary: "List all FAQs", tags: ["Storefront"], responses: { "200": { description: "Array of FAQs" } } },
      },
      "/api/orders": {
        post: { summary: "Create a new order", tags: ["Storefront"], responses: { "201": { description: "Order created" } } },
      },
      "/api/coupons/validate": {
        post: { summary: "Validate a coupon code", tags: ["Storefront"], responses: { "200": { description: "Validation result" } } },
      },
      "/api/newsletter": {
        post: { summary: "Subscribe to newsletter", tags: ["Storefront"], responses: { "201": { description: "Subscribed" } } },
      },
      "/api/dashboard": {
        get: { summary: "Storefront dashboard summary", tags: ["Storefront"], responses: { "200": { description: "Dashboard data" } } },
      },
      // ---- Admin ----
      "/api/admin/products": {
        get: { summary: "[Admin] List all products (including drafts)", tags: ["Admin"], responses: { "200": { description: "Array of products" } } },
        post: { summary: "[Admin] Create a product", tags: ["Admin"], responses: { "201": { description: "Product created" } } },
      },
      "/api/admin/products/{id}": {
        put: { summary: "[Admin] Update a product", tags: ["Admin"], responses: { "200": { description: "Product updated" } } },
        delete: { summary: "[Admin] Delete a product", tags: ["Admin"], responses: { "200": { description: "Deleted" } } },
      },
      "/api/admin/inventory": {
        get: { summary: "[Admin] List all inventory variants with stock levels", tags: ["Admin", "Inventory"], responses: { "200": { description: "Inventory rows + summary" } } },
      },
      "/api/admin/inventory/{variantId}": {
        patch: { summary: "[Admin] Update stock for a single variant (set/add/subtract)", tags: ["Admin", "Inventory"], responses: { "200": { description: "Stock updated" } } },
      },
      "/api/admin/inventory/bulk": {
        post: { summary: "[Admin] Bulk update stock for multiple variants", tags: ["Admin", "Inventory"], responses: { "200": { description: "Bulk update result" } } },
      },
      "/api/admin/orders": {
        get: { summary: "[Admin] List all orders with filters", tags: ["Admin"], responses: { "200": { description: "Array of orders" } } },
      },
      "/api/admin/orders/{id}": {
        get: { summary: "[Admin] Get order detail", tags: ["Admin"], responses: { "200": { description: "Order detail" } } },
        patch: { summary: "[Admin] Update order status / payment status", tags: ["Admin"], responses: { "200": { description: "Order updated" } } },
      },
      "/api/admin/customers": {
        get: { summary: "[Admin] List customers with segment filters", tags: ["Admin"], responses: { "200": { description: "Array of customers" } } },
      },
      "/api/admin/reviews": {
        get: { summary: "[Admin] List reviews for moderation", tags: ["Admin"], responses: { "200": { description: "Array of reviews" } } },
      },
      "/api/admin/reviews/{id}": {
        patch: { summary: "[Admin] Approve/reject/feature a review", tags: ["Admin"], responses: { "200": { description: "Review updated" } } },
        delete: { summary: "[Admin] Delete a review", tags: ["Admin"], responses: { "200": { description: "Deleted" } } },
      },
      "/api/admin/coupons": {
        get: { summary: "[Admin] List all coupons", tags: ["Admin"], responses: { "200": { description: "Array of coupons" } } },
        post: { summary: "[Admin] Create a coupon", tags: ["Admin"], responses: { "201": { description: "Coupon created" } } },
      },
      "/api/admin/coupons/{id}": {
        put: { summary: "[Admin] Update a coupon", tags: ["Admin"], responses: { "200": { description: "Coupon updated" } } },
        delete: { summary: "[Admin] Delete a coupon", tags: ["Admin"], responses: { "200": { description: "Deleted" } } },
      },
      "/api/admin/categories": {
        get: { summary: "[Admin] List all categories", tags: ["Admin"], responses: { "200": { description: "Array of categories" } } },
        post: { summary: "[Admin] Create a category", tags: ["Admin"], responses: { "201": { description: "Category created" } } },
      },
      "/api/admin/categories/{id}": {
        put: { summary: "[Admin] Update a category", tags: ["Admin"], responses: { "200": { description: "Category updated" } } },
        delete: { summary: "[Admin] Delete a category", tags: ["Admin"], responses: { "200": { description: "Deleted" } } },
      },
      "/api/admin/testimonials": {
        get: { summary: "[Admin] List all testimonials", tags: ["Admin"], responses: { "200": { description: "Array of testimonials" } } },
        post: { summary: "[Admin] Create a testimonial", tags: ["Admin"], responses: { "201": { description: "Testimonial created" } } },
      },
      "/api/admin/testimonials/{id}": {
        put: { summary: "[Admin] Update a testimonial", tags: ["Admin"], responses: { "200": { description: "Testimonial updated" } } },
        delete: { summary: "[Admin] Delete a testimonial", tags: ["Admin"], responses: { "200": { description: "Deleted" } } },
      },
      "/api/admin/faqs": {
        get: { summary: "[Admin] List all FAQs", tags: ["Admin"], responses: { "200": { description: "Array of FAQs" } } },
        post: { summary: "[Admin] Create a FAQ", tags: ["Admin"], responses: { "201": { description: "FAQ created" } } },
      },
      "/api/admin/faqs/{id}": {
        put: { summary: "[Admin] Update a FAQ", tags: ["Admin"], responses: { "200": { description: "FAQ updated" } } },
        delete: { summary: "[Admin] Delete a FAQ", tags: ["Admin"], responses: { "200": { description: "Deleted" } } },
      },
    },
    tags: [
      { name: "System", description: "Health, status, metrics, and documentation" },
      { name: "Storefront", description: "Customer-facing storefront endpoints" },
      { name: "Admin", description: "Admin panel endpoints (RBAC-protected)" },
      { name: "Inventory", description: "Inventory and stock management" },
    ],
  };

  return NextResponse.json(docs, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
