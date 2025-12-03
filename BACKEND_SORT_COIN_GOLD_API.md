# 📊 راهنمای Backend: مرتب‌سازی سکه و شمش طلا

**تاریخ:** دسامبر 2024  
**وضعیت:** 🔄 نیاز به پیاده‌سازی

---

## 📋 خلاصه تغییرات

صفحات **سکه** (`/coin`) و **شمش طلا** (`/melted-gold`) نیاز به گزینه‌های مرتب‌سازی متفاوتی نسبت به صفحات جواهرات دارند.

### ❌ گزینه‌های فعلی (برای جواهرات):

- `newest` - جدیدترین
- `oldest` - قدیمی‌ترین
- `price-low` - ارزان‌ترین
- `price-high` - گران‌ترین
- `popular` - محبوب‌ترین

### ✅ گزینه‌های جدید (برای سکه و شمش):

- `inStock` - موجود
- `outOfStock` - ناموجود
- `weight-desc` - از بیشترین وزن به کمترین
- `weight-asc` - از کمترین وزن به بیشترین

---

## 🎯 چرا این تغییر لازم است؟

### برای سکه و شمش:

- **وزن** مهم‌تر از قیمت است (مثلاً سکه 1 گرمی vs 5 گرمی)
- **موجودی** برای سرمایه‌گذاری خیلی مهم است
- کاربران می‌خواهند بر اساس وزن فیلتر کنند

### برای جواهرات:

- قیمت و محبوبیت مهم‌تر است
- وزن کمتر اهمیت دارد

---

## 🔌 تغییرات در API

### Endpoint: `GET /product/public`

**Query Parameters:**

```typescript
{
  productType: "coin" | "melted_gold",
  sortBy?: "inStock" | "outOfStock" | "weight-desc" | "weight-asc"
}
```

---

## 📝 پیاده‌سازی Backend

### 1️⃣ اضافه کردن گزینه‌های جدید به Controller

**فایل:** `controllers/productController.js` (یا `productController.ts`)

```javascript
// قبل:
const sortOptions = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "price-low": { price: 1 },
  "price-high": { price: -1 },
  popular: { popularityScore: -1 },
};

// بعد:
const sortOptions = {
  // گزینه‌های قبلی (برای جواهرات)
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "price-low": { price: 1 },
  "price-high": { price: -1 },
  popular: { popularityScore: -1 },

  // ✨ گزینه‌های جدید (برای سکه و شمش)
  inStock: { stock: -1, "goldInfo.weight": -1 }, // موجود (اول موجود، بعد بر اساس وزن)
  outOfStock: { stock: 1 }, // ناموجود
  "weight-desc": { "goldInfo.weight": -1 }, // از بیشترین وزن به کمترین
  "weight-asc": { "goldInfo.weight": 1 }, // از کمترین وزن به بیشترین
};
```

### 2️⃣ منطق مرتب‌سازی در Controller

```javascript
// در تابع getProducts یا getPublicProducts

exports.getPublicProducts = async (req, res) => {
  try {
    const { productType, sortBy } = req.query;

    // ساخت query
    let query = {};
    if (productType) {
      query.productType = productType;
    }

    // ساخت sort object
    let sort = {};

    if (sortBy) {
      // ✨ اگر productType سکه یا شمش است، از گزینه‌های جدید استفاده کن
      if (productType === "coin" || productType === "melted_gold") {
        switch (sortBy) {
          case "inStock":
            // اول موجودها، بعد بر اساس وزن
            sort = { stock: -1, "goldInfo.weight": -1 };
            query.stock = { $gt: 0 }; // فقط موجودها
            break;

          case "outOfStock":
            sort = { stock: 1 };
            query.stock = { $lte: 0 }; // فقط ناموجودها
            break;

          case "weight-desc":
            sort = { "goldInfo.weight": -1 };
            break;

          case "weight-asc":
            sort = { "goldInfo.weight": 1 };
            break;

          default:
            sort = { createdAt: -1 }; // پیش‌فرض
        }
      } else {
        // برای جواهرات از گزینه‌های قبلی استفاده کن
        sort = sortOptions[sortBy] || { createdAt: -1 };
      }
    } else {
      sort = { createdAt: -1 }; // پیش‌فرض
    }

    // اجرای query
    const products = await Product.find(query)
      .sort(sort)
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .limit(parseInt(req.query.limit) || 100);

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
```

### 3️⃣ فیلتر موجودی (Stock Filter)

**مهم:** برای `inStock` و `outOfStock` باید query رو تغییر بدید:

```javascript
// برای inStock
if (sortBy === "inStock") {
  query.stock = { $gt: 0 }; // موجود = stock > 0
}

// برای outOfStock
if (sortBy === "outOfStock") {
  query.stock = { $lte: 0 }; // ناموجود = stock <= 0
}
```

---

## 🗄️ ساختار Schema

### Product Schema باید شامل باشد:

```javascript
{
  productType: {
    type: String,
    enum: ['jewelry', 'coin', 'melted_gold'],
    required: true
  },
  stock: {
    type: Number,
    default: 0,
    required: true
  },
  goldInfo: {
    weight: {
      type: Number, // وزن به گرم (مثال: 1, 2.5, 5)
      required: function() {
        return this.productType === 'coin' || this.productType === 'melted_gold';
      }
    },
    purity: String, // خلوص (مثال: "900", "999.9")
    certificate: String, // شماره گواهی
    mintYear: Number, // سال ضرب (فقط برای سکه)
    manufacturer: String // تولید کننده (فقط برای شمش)
  }
}
```

---

## 📊 مثال‌های API Request

### 1. دریافت سکه‌های موجود (مرتب بر اساس وزن)

```bash
GET /product/public?productType=coin&sortBy=inStock
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "سکه تمام بهار آزادی",
      "productType": "coin",
      "stock": 10,
      "goldInfo": {
        "weight": 8.13,
        "purity": "900",
        "mintYear": 2024
      },
      "price": 25000000
    },
    {
      "_id": "...",
      "name": "سکه نیم بهار آزادی",
      "productType": "coin",
      "stock": 5,
      "goldInfo": {
        "weight": 4.07,
        "purity": "900",
        "mintYear": 2024
      },
      "price": 12500000
    }
  ]
}
```

### 2. دریافت شمش‌های از بیشترین وزن به کمترین

```bash
GET /product/public?productType=melted_gold&sortBy=weight-desc
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "شمش طلا 100 گرمی",
      "productType": "melted_gold",
      "stock": 3,
      "goldInfo": {
        "weight": 100,
        "purity": "999.9",
        "manufacturer": "ملی ایران"
      },
      "price": 300000000
    },
    {
      "_id": "...",
      "name": "شمش طلا 50 گرمی",
      "productType": "melted_gold",
      "stock": 5,
      "goldInfo": {
        "weight": 50,
        "purity": "999.9",
        "manufacturer": "ملی ایران"
      },
      "price": 150000000
    }
  ]
}
```

### 3. دریافت سکه‌های ناموجود

```bash
GET /product/public?productType=coin&sortBy=outOfStock
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "سکه ربع بهار آزادی",
      "productType": "coin",
      "stock": 0,
      "goldInfo": {
        "weight": 2.03,
        "purity": "900"
      },
      "price": 6250000
    }
  ]
}
```

---

## ✅ چک‌لیست پیاده‌سازی

- [ ] اضافه کردن گزینه‌های `inStock`, `outOfStock`, `weight-desc`, `weight-asc` به sort options
- [ ] پیاده‌سازی منطق فیلتر موجودی (`stock > 0` برای موجود، `stock <= 0` برای ناموجود)
- [ ] پیاده‌سازی مرتب‌سازی بر اساس `goldInfo.weight`
- [ ] تست با `productType=coin`
- [ ] تست با `productType=melted_gold`
- [ ] تست همه گزینه‌های مرتب‌سازی
- [ ] بررسی performance (index روی `goldInfo.weight` و `stock`)
- [ ] مستندسازی API

---

## 🔍 نکات مهم

### 1. Index برای Performance

برای بهبود performance، index اضافه کنید:

```javascript
// در Schema یا migration
ProductSchema.index({ "goldInfo.weight": 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ productType: 1, stock: 1, "goldInfo.weight": 1 });
```

### 2. مقدار پیش‌فرض برای وزن

اگر `goldInfo.weight` وجود نداشت:

```javascript
// در Controller
const products = await Product.find(query).sort(sort).lean(); // برای performance

// اگر weight وجود نداشت، می‌توانید از 0 استفاده کنید یا فیلتر کنید
products.forEach((product) => {
  if (!product.goldInfo?.weight) {
    product.goldInfo = product.goldInfo || {};
    product.goldInfo.weight = 0; // یا null
  }
});
```

### 3. ترکیب فیلترها

می‌توانید فیلتر موجودی را با مرتب‌سازی وزن ترکیب کنید:

```javascript
// موجود + مرتب بر اساس وزن (از بیشترین به کمترین)
GET /product/public?productType=coin&sortBy=inStock

// در Controller:
if (sortBy === 'inStock') {
  query.stock = { $gt: 0 };
  sort = { 'goldInfo.weight': -1 }; // اول موجود، بعد بر اساس وزن
}
```

---

## 🐛 رفع مشکلات احتمالی

### مشکل 1: `goldInfo.weight` null است

**راه حل:**

```javascript
// در sort، از null handling استفاده کنید
sort = {
  "goldInfo.weight": -1,
  createdAt: -1, // برای tie-breaker
};

// یا فیلتر کنید
if (sortBy === "weight-desc" || sortBy === "weight-asc") {
  query["goldInfo.weight"] = { $exists: true, $ne: null };
}
```

### مشکل 2: Performance کند است

**راه حل:**

- Index اضافه کنید
- از `lean()` استفاده کنید
- Pagination را در backend انجام دهید (نه frontend)

---

## 📊 خلاصه تغییرات

| قبل                                                      | بعد                                                  |
| -------------------------------------------------------- | ---------------------------------------------------- |
| `newest`, `oldest`, `price-low`, `price-high`, `popular` | `inStock`, `outOfStock`, `weight-desc`, `weight-asc` |
| مرتب‌سازی فقط بر اساس قیمت/تاریخ                         | مرتب‌سازی بر اساس موجودی و وزن                       |
| بدون فیلتر موجودی                                        | فیلتر موجود/ناموجود                                  |

---

**موفق باشید! 🎉**

همه تغییرات Frontend انجام شده و آماده استفاده با Backend جدید است.
