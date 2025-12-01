# 🪙 راهنمای Backend: صفحات سکه و شمش طلا

## 📋 خلاصه

دو صفحه جدید برای **سکه طلا** و **شمش طلا (طلای آب شده)** در frontend ایجاد شده است که نیاز به API و زیرساخت backend دارند.

**مسیرهای Frontend:**
- `/coin` - صفحه سکه طلا
- `/melted-gold` - صفحه شمش طلا

---

## 🎯 نیازمندی‌ها

### 1️⃣ افزودن فیلد جدید به مدل Product

برای تمایز محصولات سکه و شمش از سایر محصولات، نیاز به اضافه کردن یک فیلد جدید داریم:

```javascript
// models/Product.js

const productSchema = new mongoose.Schema({
  // ... فیلدهای موجود ...
  
  // ✨ فیلد جدید
  productType: {
    type: String,
    enum: ['jewelry', 'coin', 'melted_gold'], // نوع محصول
    default: 'jewelry',
    index: true // برای سرعت جستجو
  },
  
  // اطلاعات اختصاصی سکه/شمش (اختیاری)
  goldInfo: {
    weight: Number,        // وزن به گرم
    purity: String,        // خلوص (مثلاً "24K" یا "999.9")
    certificate: String,   // شماره گواهی
    mintYear: Number,      // سال ضرب (برای سکه)
    manufacturer: String   // تولید کننده (برای شمش)
  }
});
```

---

## 🔌 API Endpoints مورد نیاز

### ✅ استفاده از API موجود با فیلتر جدید

API فعلی `GET /api/products` را می‌توان با query parameter جدید استفاده کرد:

```
GET /api/products?productType=coin&limit=20
GET /api/products?productType=melted_gold&limit=20
```

### 📝 تغییرات در Controller

```javascript
// controllers/productController.js

exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      onSale,
      lowCommission,
      sortBy,
      limit = 20,
      page = 1,
      productType, // ✨ پارامتر جدید
    } = req.query;

    const filter = {};

    // ✨ فیلتر بر اساس نوع محصول
    if (productType) {
      filter.productType = productType;
    }

    // فیلترهای دیگر...
    if (category) filter['category.slug'] = category;
    if (subcategory) filter['subcategory.slug'] = subcategory;
    if (onSale === 'true') filter.onSale = true;
    if (lowCommission === 'true') filter.lowCommission = true;

    // مرتب‌سازی
    let sort = {};
    if (sortBy === 'popular') {
      sort = { salesCount: -1, viewsCount: -1 };
    } else if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'price-asc') {
      sort = { price: 1 };
    } else if (sortBy === 'price-desc') {
      sort = { price: -1 };
    }

    const products = await Product.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت محصولات',
      error: error.message,
    });
  }
};
```

---

## 🗄️ Migration برای محصولات موجود

برای محصولات موجود که قبلاً اضافه شده‌اند، باید `productType` را `jewelry` قرار دهید:

```javascript
// migrations/updateProductType.js

const Product = require('../models/Product');

async function migrateProductTypes() {
  try {
    // تمام محصولاتی که productType ندارند را به jewelry تبدیل کن
    const result = await Product.updateMany(
      { productType: { $exists: false } },
      { $set: { productType: 'jewelry' } }
    );

    console.log(`✅ ${result.modifiedCount} محصول به‌روزرسانی شد`);
  } catch (error) {
    console.error('❌ خطا در migration:', error);
  }
}

// اجرای migration
migrateProductTypes();
```

---

## 📊 نمونه داده برای تست

### سکه طلا:

```json
{
  "name": "سکه تمام بهار آزادی",
  "slug": "coin-bahar-azadi-full",
  "price": 50000000,
  "productType": "coin",
  "category": "6507f1b2e1234567890abcde",
  "images": [
    "/images/products/coin.png"
  ],
  "description": "سکه تمام بهار آزادی با خلوص 900",
  "goldInfo": {
    "weight": 8.13,
    "purity": "900",
    "mintYear": 2024
  },
  "stock": 10,
  "available": true
}
```

### شمش طلا:

```json
{
  "name": "شمش طلای 10 گرمی",
  "slug": "gold-bar-10g",
  "price": 15000000,
  "productType": "melted_gold",
  "category": "6507f1b2e1234567890abcde",
  "images": [
    "/images/products/shemsh.png"
  ],
  "description": "شمش طلای 24 عیار با خلوص 999.9",
  "goldInfo": {
    "weight": 10,
    "purity": "999.9",
    "manufacturer": "بانک مرکزی",
    "certificate": "CB-2024-001234"
  },
  "stock": 5,
  "available": true
}
```

---

## 🔍 تست API

### 1. دریافت سکه‌ها:
```bash
curl -X GET "http://localhost:4001/api/products?productType=coin&limit=20"
```

### 2. دریافت شمش‌ها:
```bash
curl -X GET "http://localhost:4001/api/products?productType=melted_gold&limit=20"
```

### 3. دریافت جواهرات (محصولات عادی):
```bash
curl -X GET "http://localhost:4001/api/products?productType=jewelry&limit=20"
```

---

## 📱 تغییرات در Frontend

Frontend از همان API موجود استفاده می‌کند:

```typescript
// فعلی (بدون فیلتر - همه محصولات)
const allProducts = await getProducts({ limit: 20 });

// ✨ جدید (با فیلتر نوع محصول)
// در src/app/coin/page.tsx
const coinProducts = await getProducts({ 
  productType: 'coin', 
  limit: 20 
});

// در src/app/melted-gold/page.tsx
const goldBarProducts = await getProducts({ 
  productType: 'melted_gold', 
  limit: 20 
});
```

**تغییر در `src/lib/api/products.ts`:**

```typescript
export async function getProducts(params?: {
  category?: string;
  subcategory?: string;
  onSale?: boolean;
  lowCommission?: boolean;
  sortBy?: string;
  limit?: number;
  page?: number;
  productType?: 'jewelry' | 'coin' | 'melted_gold'; // ✨ جدید
}): Promise<Product[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.category) queryParams.append("category", params.category);
  if (params?.subcategory) queryParams.append("subcategory", params.subcategory);
  if (params?.onSale) queryParams.append("onSale", "true");
  if (params?.lowCommission) queryParams.append("lowCommission", "true");
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.productType) queryParams.append("productType", params.productType); // ✨ جدید

  const response = await fetch(
    `${API_BASE_URL}/products?${queryParams.toString()}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await response.json();
  return data.data || [];
}
```

---

## 🎨 تصاویر مورد نیاز

تصاویر زیر در frontend استفاده شده‌اند:

1. **Hero سکه:** `/images/products/qadimtamam.png` ✅
2. **Hero شمش:** `/images/products/shemsh.png` ✅
3. **آیکون سکه در navbar:** `/images/products/coin.png` ✅

---

## ✅ چک‌لیست پیاده‌سازی Backend

- [ ] اضافه کردن فیلد `productType` به schema مدل Product
- [ ] اضافه کردن فیلد اختیاری `goldInfo` به schema
- [ ] به‌روزرسانی controller برای پشتیبانی از فیلتر `productType`
- [ ] اجرای migration برای محصولات موجود
- [ ] اضافه کردن ایندکس به فیلد `productType` برای بهبود performance
- [ ] اضافه کردن validation برای `productType` در routes
- [ ] ایجاد حداقل 5 محصول نمونه سکه
- [ ] ایجاد حداقل 5 محصول نمونه شمش طلا
- [ ] تست API با Postman یا curl
- [ ] مستندسازی API جدید

---

## 🚀 مراحل استقرار (Deployment)

1. **توسعه (Development):**
   - پیاده‌سازی تغییرات در local
   - تست کامل API
   - اضافه کردن محصولات نمونه

2. **Staging:**
   - اجرای migration
   - تست با frontend
   - بررسی performance

3. **Production:**
   - اجرای migration روی دیتابیس production
   - استقرار کد جدید
   - مانیتورینگ

---

## 📞 پشتیبانی

در صورت نیاز به راهنمایی بیشتر یا وجود مشکل:
- بررسی لاگ‌های backend
- تست API با Postman
- بررسی response و status codes
- چک کردن اتصال database

---

## 📚 منابع مرتبط

- مدل Product فعلی: `models/Product.js`
- Controller محصولات: `controllers/productController.js`
- Routes: `routes/products.js`
- Frontend API: `src/lib/api/products.ts`

---

**تاریخ ایجاد:** دسامبر 2024  
**نسخه:** 1.0  
**وضعیت:** در انتظار پیاده‌سازی Backend

