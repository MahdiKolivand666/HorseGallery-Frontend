# 🔍 Backend Search API Documentation

این document شامل تمام تغییرات و راهنمای پیاده‌سازی **قابلیت جستجو** در سایت است.

---

## 📋 خلاصه

کاربر می‌تواند در navbar روی آیکون جستجو کلیک کند، کلمه کلیدی را وارد کند، و محصولات مرتبط را مشاهده کند.

**مسیر جستجو:** `/search?q=گردنبند`

---

## 🎯 API Endpoint

```
GET /product/public/search
```

**Base URL:** `http://localhost:4001`

**Full URL:** `http://localhost:4001/product/public/search?q=گردنبند&page=1&limit=20&sort=newest`

---

## 📊 Query Parameters

| Parameter | Type   | Required   | Description            | Default  | Example       |
| --------- | ------ | ---------- | ---------------------- | -------- | ------------- |
| `q`       | string | ✅ **Yes** | عبارت جستجو            | -        | `گردنبند طلا` |
| `page`    | number | ❌ No      | شماره صفحه             | `1`      | `2`           |
| `limit`   | number | ❌ No      | تعداد نتایج در هر صفحه | `20`     | `10`          |
| `sort`    | string | ❌ No      | مرتب‌سازی              | `newest` | `price-asc`   |

### Sort Options:

- `newest` - جدیدترین محصولات (پیش‌فرض)
- `oldest` - قدیمی‌ترین محصولات
- `price-asc` - ارزان‌ترین
- `price-desc` - گران‌ترین
- `popular` - محبوب‌ترین (بر اساس salesCount)

---

## 📤 Response Format

### ✅ Success Response:

```json
{
  "success": true,
  "query": "گردنبند",
  "data": [
    {
      "_id": "6925bd9b0f9ef8a36b595aa6",
      "name": "گردنبند طلای کلاسیک",
      "slug": "classic-gold-necklace-001",
      "code": "GN-001-18K",
      "description": "گردنبند زیبا با طراحی کلاسیک و ظریف، مناسب برای مهمانی‌ها و مجالس",
      "price": 45000000,
      "discountPrice": 43000000,
      "stock": 12,
      "images": [
        "/images/products/product1.webp",
        "/images/products/product1-1.webp"
      ],
      "category": {
        "_id": "6925bd9b0f9ef8a36b595a93",
        "name": "زنانه",
        "slug": "women"
      },
      "subcategory": {
        "_id": "6925bd9b0f9ef8a36b595a94",
        "name": "گردنبند",
        "slug": "necklace"
      },
      "specifications": {
        "weight": "5 گرم",
        "karat": "18 عیار",
        "material": "طلا",
        "brand": "گالری اسب"
      },
      "isAvailable": true,
      "onSale": true,
      "discount": 5,
      "lowCommission": false,
      "rating": 4.5,
      "reviewsCount": 128,
      "salesCount": 45,
      "viewsCount": 1264,
      "createdAt": "2025-11-25T14:30:51.087Z",
      "updatedAt": "2025-11-28T17:26:51.668Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 89,
    "itemsPerPage": 20
  }
}
```

### ❌ Error Response:

```json
{
  "success": false,
  "error": "Query parameter is required",
  "query": "",
  "data": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 0,
    "totalItems": 0,
    "itemsPerPage": 20
  }
}
```

---

## 💻 Backend Implementation (Node.js + MongoDB)

### 📁 Route Setup

```javascript
// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const { searchProducts } = require("../controllers/productController");

// Search endpoint
router.get("/product/public/search", searchProducts);

module.exports = router;
```

---

### 🎯 Controller Implementation

```javascript
// controllers/productController.js

/**
 * Search products by query
 * @route   GET /product/public/search
 * @access  Public
 */
const searchProducts = async (req, res) => {
  try {
    // Extract query parameters
    const {
      q, // Search query (required)
      page = 1, // Page number (default: 1)
      limit = 20, // Items per page (default: 20)
      sort = "newest", // Sort option (default: newest)
    } = req.query;

    // Validation: Check if query is provided
    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "پارامتر جستجو الزامی است",
        query: "",
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: parseInt(limit),
        },
      });
    }

    const searchQuery = q.trim();
    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (pageNumber - 1) * pageLimit;

    // Build search filter
    // جستجو در چند فیلد: name, description, code, tags
    const searchFilter = {
      $or: [
        { name: { $regex: searchQuery, $options: "i" } }, // نام محصول
        { description: { $regex: searchQuery, $options: "i" } }, // توضیحات
        { code: { $regex: searchQuery, $options: "i" } }, // کد محصول
        { tags: { $regex: searchQuery, $options: "i" } }, // تگ‌ها (اگر دارید)
      ],
      isAvailable: true, // فقط محصولات موجود
      stock: { $gt: 0 }, // فقط محصولاتی که موجودی دارند
    };

    // Build sort option
    let sortOption = {};
    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "price-asc":
        sortOption = { price: 1 };
        break;
      case "price-desc":
        sortOption = { price: -1 };
        break;
      case "popular":
        sortOption = { salesCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Execute search query
    const products = await Product.find(searchFilter)
      .sort(sortOption)
      .skip(skip)
      .limit(pageLimit)
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .select("-__v")
      .lean();

    // Count total results
    const totalItems = await Product.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalItems / pageLimit);

    // Return results
    res.status(200).json({
      success: true,
      query: searchQuery,
      data: products,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems,
        itemsPerPage: pageLimit,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در جستجو",
      query: req.query.q || "",
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: parseInt(req.query.limit) || 20,
      },
    });
  }
};

module.exports = { searchProducts };
```

---

## 🚀 Advanced Features (Optional)

### 1️⃣ **Text Index for Better Performance**

اگر می‌خواهید جستجو سریع‌تر باشد، از Text Index استفاده کنید:

```javascript
// models/Product.js

// اضافه کردن index به Schema
productSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text'
}, {
  weights: {
    name: 10,        // نام محصول وزن بیشتری دارد
    tags: 5,         // تگ‌ها وزن متوسط
    description: 1   // توضیحات وزن کمتر
  }
});

// استفاده از Text Search در Controller:
const searchFilter = {
  $text: { $search: searchQuery },
  isAvailable: true,
  stock: { $gt: 0 }
};

// مرتب‌سازی بر اساس relevance:
const products = await Product.find(searchFilter)
  .sort({ score: { $meta: 'textScore' } })
  .skip(skip)
  .limit(pageLimit)
  ...
```

---

### 2️⃣ **Fuzzy Search (تشخیص غلط‌های املایی)**

برای پشتیبانی از غلط‌های تایپی:

```javascript
// استفاده از regex با tolerance بیشتر
const words = searchQuery.split(" ").filter((w) => w.length > 2);

const searchFilter = {
  $or: words.flatMap((word) => [
    { name: { $regex: word, $options: "i" } },
    { description: { $regex: word, $options: "i" } },
  ]),
  isAvailable: true,
  stock: { $gt: 0 },
};
```

---

### 3️⃣ **Search Suggestions (پیشنهادات جستجو)**

برای نمایش پیشنهادات در حین تایپ:

```javascript
/**
 * Get search suggestions
 * @route   GET /product/public/search/suggestions
 */
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await Product.find({
      name: { $regex: q, $options: "i" },
      isAvailable: true,
    })
      .select("name slug")
      .limit(5)
      .lean();

    res.json({
      suggestions: suggestions.map((p) => ({
        name: p.name,
        slug: p.slug,
      })),
    });
  } catch (error) {
    console.error("Suggestions error:", error);
    res.json({ suggestions: [] });
  }
};
```

---

### 4️⃣ **Search Analytics (آمار جستجو)**

برای ذخیره و تحلیل جستجوها:

```javascript
// models/SearchLog.js
const searchLogSchema = new mongoose.Schema({
  query: { type: String, required: true },
  resultsCount: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ipAddress: String,
  timestamp: { type: Date, default: Date.now },
});

// در Controller:
await SearchLog.create({
  query: searchQuery,
  resultsCount: totalItems,
  userId: req.user?._id,
  ipAddress: req.ip,
});
```

---

## ⚡ Performance Optimization

### 1. **Database Indexes:**

```javascript
// اضافه کردن indexes برای سرعت بیشتر
productSchema.index({ name: 1 });
productSchema.index({ isAvailable: 1, stock: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ price: 1 });
```

### 2. **Caching (Redis):**

```javascript
const redis = require("redis");
const client = redis.createClient();

// Cache search results for 5 minutes
const cacheKey = `search:${searchQuery}:${page}:${limit}:${sort}`;
const cachedResults = await client.get(cacheKey);

if (cachedResults) {
  return res.json(JSON.parse(cachedResults));
}

// ... perform search ...

// Cache the results
await client.setex(cacheKey, 300, JSON.stringify(response));
```

### 3. **Limit Fields:**

```javascript
// فقط فیلدهای مورد نیاز را بگیرید
.select('name slug price images category subcategory discount onSale stock rating')
```

---

## 🧪 Testing

### Test با cURL:

```bash
# جستجوی ساده
curl "http://localhost:4001/product/public/search?q=گردنبند"

# با pagination
curl "http://localhost:4001/product/public/search?q=گردنبند&page=2&limit=10"

# با sort
curl "http://localhost:4001/product/public/search?q=گردنبند&sort=price-asc"

# جستجوی خالی (باید error برگرداند)
curl "http://localhost:4001/product/public/search?q="
```

### Test با Postman/Insomnia:

1. **Method:** GET
2. **URL:** `http://localhost:4001/product/public/search`
3. **Query Params:**
   - `q`: `گردنبند`
   - `page`: `1`
   - `limit`: `20`
   - `sort`: `newest`

---

## 📝 Product Schema Requirements

مطمئن شوید Schema محصولات شما این فیلدها را دارد:

```javascript
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  code: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  stock: { type: Number, default: 0 },
  images: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
  isAvailable: { type: Boolean, default: true },
  onSale: { type: Boolean, default: false },
  discount: { type: Number, min: 0, max: 100 },
  lowCommission: { type: Boolean, default: false },
  salesCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

---

## ✅ Implementation Checklist

پیاده‌سازی را به ترتیب زیر انجام دهید:

- [ ] **Route اضافه شود:** `GET /product/public/search`
- [ ] **Controller پیاده‌سازی شود:** `searchProducts`
- [ ] **Validation اضافه شود:** بررسی `q` parameter
- [ ] **Search filter ساخته شود:** جستجو در name, description, code
- [ ] **Pagination پیاده‌سازی شود:** page, limit
- [ ] **Sort options اضافه شود:** newest, price-asc, etc.
- [ ] **Populate شود:** category, subcategory
- [ ] **Error handling درست کار کند**
- [ ] **Indexes اضافه شوند**
- [ ] **Test شود با cURL/Postman**
- [ ] **Frontend تست شود:** `/search?q=گردنبند`

---

## 📞 پشتیبانی

اگر سوال یا مشکلی دارید:

- مستندات را با دقت مطالعه کنید
- از Test Examples استفاده کنید
- Error messages را بررسی کنید
- Console logs را چک کنید

---

## 🎯 نتیجه

بعد از پیاده‌سازی این API:

✅ کاربران می‌توانند محصولات را جستجو کنند
✅ نتایج صفحه‌بندی می‌شوند
✅ مرتب‌سازی انجام می‌شود
✅ تنها محصولات موجود نمایش داده می‌شوند
✅ جستجو در چند فیلد انجام می‌شود

**موفق باشید! 🚀**
