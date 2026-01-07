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
    GOLD_PRICE_LATEST: "/gold-price/latest", // قیمت لحظه‌ای از API خارجی

    // Gold Investment (Public)
    GOLD_INVESTMENT_INFO: "/gold-investment/info", // اطلاعات خرید طلا (حداقل/حداکثر، کارمزد)

    // Announcements (Public)
    ANNOUNCEMENTS: "/announcement",

    // Cart
    CART: "/site/cart",

    // Shipping Methods
    SHIPPING_METHODS: "/site/shipping/methods",
  },
};

export default API_CONFIG;
