/**
 * API Configuration
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001",
  ENDPOINTS: {
    // Products (Public - بدون Authorization)
    PRODUCTS: "/product/public",
    PRODUCT_CATEGORIES: "/product-category/public",

    // Blog (Public - بدون Authorization)
    BLOGS: "/blog/public",

    // FAQ (Public)
    FAQ: "/faq",

    // Gold Price (Public)
    GOLD_PRICE: "/gold-price",

    // Announcements (Public)
    ANNOUNCEMENTS: "/announcement",

    // Cart
    CART: "/site/cart",
  },
};

export default API_CONFIG;
