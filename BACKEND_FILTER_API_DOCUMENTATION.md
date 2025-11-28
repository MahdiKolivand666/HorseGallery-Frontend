# Backend API - Product Filtering Documentation

## مستندات API فیلتر محصولات برای Backend

این document شامل تمام اطلاعات لازم برای پیاده‌سازی فیلترینگ محصولات در backend است.

---

## 📋 خلاصه تغییرات مورد نیاز

Frontend الان تمام filter parameters رو به API ارسال می‌کنه. Backend باید این parameter ها رو دریافت و پردازش کنه.

---

## 🔗 API Endpoint

```
GET /api/products
```

---

## 📥 Query Parameters

### 1️⃣ **Pagination & Sorting**

| Parameter | Type   | Required | Description              | Example                                        |
| --------- | ------ | -------- | ------------------------ | ---------------------------------------------- |
| `page`    | number | No       | شماره صفحه               | `1`                                            |
| `limit`   | number | No       | تعداد محصولات در هر صفحه | `18`                                           |
| `sortBy`  | string | No       | نحوه مرتب‌سازی           | `newest`, `price-asc`, `price-desc`, `popular` |

### 2️⃣ **Category & Subcategory**

| Parameter     | Type   | Required | Description         | Example                           |
| ------------- | ------ | -------- | ------------------- | --------------------------------- |
| `category`    | string | No       | slug دسته‌بندی اصلی | `rings`, `necklaces`, `bracelets` |
| `subcategory` | string | No       | slug زیر دسته‌بندی  | `engagement-rings`, `pendants`    |

### 3️⃣ **Price Range Filter**

| Parameter  | Type   | Required | Description         | Example    |
| ---------- | ------ | -------- | ------------------- | ---------- |
| `minPrice` | number | No       | حداقل قیمت (تومان)  | `0`        |
| `maxPrice` | number | No       | حداکثر قیمت (تومان) | `50000000` |

### 4️⃣ **Color Filter** (Array)

| Parameter | Type     | Required | Description              | Example                                |
| --------- | -------- | -------- | ------------------------ | -------------------------------------- |
| `colors`  | string[] | No       | آرایه رنگ‌های انتخاب شده | `gold`, `silver`, `rose-gold`, `white` |

**نحوه ارسال از frontend:**

```
?colors=gold&colors=silver&colors=rose-gold
```

### 5️⃣ **Karat Filter** (Array)

| Parameter | Type     | Required | Description              | Example          |
| --------- | -------- | -------- | ------------------------ | ---------------- |
| `karats`  | string[] | No       | آرایه عیارهای انتخاب شده | `18`, `21`, `24` |

**نحوه ارسال از frontend:**

```
?karats=18&karats=21
```

### 6️⃣ **Brand Filter** (Array)

| Parameter | Type     | Required | Description              | Example                   |
| --------- | -------- | -------- | ------------------------ | ------------------------- |
| `brands`  | string[] | No       | آرایه برندهای انتخاب شده | `Horse Gallery`, `برند 2` |

**نحوه ارسال از frontend:**

```
?brands=Horse Gallery&brands=برند 2
```

### 7️⃣ **Branch Filter** (Array)

| Parameter  | Type     | Required | Description            | Example                   |
| ---------- | -------- | -------- | ---------------------- | ------------------------- |
| `branches` | string[] | No       | آرایه شعبات انتخاب شده | `Horse Gallery`, `شعبه 2` |

**نحوه ارسال از frontend:**

```
?branches=Horse Gallery&branches=شعبه 2
```

### 8️⃣ **Wage Filter** (Array)

| Parameter | Type     | Required | Description               | Example               |
| --------- | -------- | -------- | ------------------------- | --------------------- |
| `wages`   | string[] | No       | آرایه اجرت‌های انتخاب شده | `کم`, `متوسط`, `زیاد` |

**نحوه ارسال از frontend:**

```
?wages=کم&wages=متوسط
```

### 9️⃣ **Size Filter** (Array)

| Parameter | Type     | Required | Description              | Example                 |
| --------- | -------- | -------- | ------------------------ | ----------------------- |
| `sizes`   | string[] | No       | آرایه سایزهای انتخاب شده | `کوچک`, `متوسط`, `بزرگ` |

**نحوه ارسال از frontend:**

```
?sizes=کوچک&sizes=بزرگ
```

### 🔟 **Coating Filter** (Array)

| Parameter  | Type     | Required | Description               | Example                      |
| ---------- | -------- | -------- | ------------------------- | ---------------------------- |
| `coatings` | string[] | No       | آرایه پوشش‌های انتخاب شده | `رودیوم`, `طلا`, `بدون پوشش` |

**نحوه ارسال از frontend:**

```
?coatings=رودیوم&coatings=طلا
```

### 1️⃣1️⃣ **Weight Range Filter**

| Parameter   | Type   | Required | Description      | Example |
| ----------- | ------ | -------- | ---------------- | ------- |
| `minWeight` | number | No       | حداقل وزن (گرم)  | `0`     |
| `maxWeight` | number | No       | حداکثر وزن (گرم) | `100`   |

### 1️⃣2️⃣ **Stock & Sale Filters**

| Parameter       | Type    | Required | Description            | Example |
| --------------- | ------- | -------- | ---------------------- | ------- |
| `inStock`       | boolean | No       | فقط محصولات موجود      | `true`  |
| `onSale`        | boolean | No       | فقط محصولات تخفیف‌دار  | `true`  |
| `lowCommission` | boolean | No       | فقط محصولات با اجرت کم | `true`  |

### 1️⃣3️⃣ **Feature Filters** (قبلاً موجود بود)

| Parameter       | Type    | Required | Description    | Example |
| --------------- | ------- | -------- | -------------- | ------- |
| `isFeatured`    | boolean | No       | محصولات ویژه   | `true`  |
| `isBestSelling` | boolean | No       | پرفروش‌ترین‌ها | `true`  |
| `isNewArrival`  | boolean | No       | تازه‌ها        | `true`  |
| `isGift`        | boolean | No       | محصولات کادویی | `true`  |

---

## 📤 Response Format

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "انگشتر طلا",
      "slug": "gold-ring-1",
      "code": "GR-001",
      "description": "انگشتر طلای زیبا",
      "price": 25000000,
      "discountPrice": 22000000,
      "stock": 5,
      "images": ["/images/products/ring1.jpg"],
      "category": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "انگشتر",
        "slug": "rings"
      },
      "subcategory": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "انگشتر نامزدی",
        "slug": "engagement-rings"
      },
      "specifications": {
        "weight": "5.2",
        "karat": "18",
        "material": "طلا",
        "brand": "Horse Gallery",
        "coverage": "رودیوم",
        "warranty": "18 ماهه"
      },
      "isAvailable": true,
      "isFeatured": false,
      "isBestSelling": true,
      "isNewArrival": false,
      "isGift": false,
      "rating": 4.5,
      "reviewsCount": 12,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T14:25:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 180,
    "itemsPerPage": 18
  }
}
```

---

## 🔍 مثال‌های Real Request

### مثال 1: فیلتر ساده با قیمت و دسته‌بندی

```
GET /api/products?category=rings&minPrice=10000000&maxPrice=50000000&page=1&limit=18
```

### مثال 2: فیلتر با چند رنگ و عیار

```
GET /api/products?category=necklaces&colors=gold&colors=rose-gold&karats=18&karats=21&page=1
```

### مثال 3: فیلتر کامل با همه parameter ها

```
GET /api/products?category=bracelets&minPrice=5000000&maxPrice=30000000&colors=gold&colors=silver&karats=18&brands=Horse Gallery&minWeight=3&maxWeight=10&inStock=true&sortBy=price-asc&page=1&limit=18
```

### مثال 4: فیلتر محصولات تخفیف‌دار

```
GET /api/products?onSale=true&page=1&limit=18
```

---

## 🛠️ Backend Implementation Guide

### 1️⃣ **دریافت Query Parameters**

```javascript
// Express.js Example
app.get("/api/products", async (req, res) => {
  const {
    // Pagination
    page = 1,
    limit = 18,
    sortBy = "newest",

    // Category
    category,
    subcategory,

    // Price
    minPrice,
    maxPrice,

    // Arrays (will be received as multiple params with same name)
    colors, // req.query.colors could be string or array
    karats,
    brands,
    branches,
    wages,
    sizes,
    coatings,

    // Weight
    minWeight,
    maxWeight,

    // Booleans
    inStock,
    onSale,
    lowCommission,
    isFeatured,
    isBestSelling,
    isNewArrival,
    isGift,
  } = req.query;

  // Build MongoDB query...
});
```

### 2️⃣ **تبدیل Array Parameters**

```javascript
// Helper function to ensure array format
const toArray = (param) => {
  if (!param) return [];
  return Array.isArray(param) ? param : [param];
};

const colorsArray = toArray(colors);
const karatsArray = toArray(karats);
const brandsArray = toArray(brands);
// ... etc
```

### 3️⃣ **ساخت MongoDB Query**

```javascript
// Build MongoDB filter object
const filter = {};

// Category & Subcategory
if (category) {
  filter["category.slug"] = category;
}
if (subcategory) {
  filter["subcategory.slug"] = subcategory;
}

// Price Range
if (minPrice || maxPrice) {
  filter.price = {};
  if (minPrice) filter.price.$gte = Number(minPrice);
  if (maxPrice) filter.price.$lte = Number(maxPrice);
}

// Colors
const colorsArray = toArray(colors);
if (colorsArray.length > 0) {
  filter["specifications.color"] = { $in: colorsArray };
}

// Karats
const karatsArray = toArray(karats);
if (karatsArray.length > 0) {
  filter["specifications.karat"] = { $in: karatsArray };
}

// Brands
const brandsArray = toArray(brands);
if (brandsArray.length > 0) {
  filter["specifications.brand"] = { $in: brandsArray };
}

// Branches
const branchesArray = toArray(branches);
if (branchesArray.length > 0) {
  filter["specifications.branch"] = { $in: branchesArray };
}

// Wages
const wagesArray = toArray(wages);
if (wagesArray.length > 0) {
  filter["specifications.wage"] = { $in: wagesArray };
}

// Sizes
const sizesArray = toArray(sizes);
if (sizesArray.length > 0) {
  filter["specifications.size"] = { $in: sizesArray };
}

// Coatings
const coatingsArray = toArray(coatings);
if (coatingsArray.length > 0) {
  filter["specifications.coating"] = { $in: coatingsArray };
}

// Weight Range
if (minWeight || maxWeight) {
  // Note: weight might be stored as string, convert to number for comparison
  filter.$expr = {
    $and: [],
  };
  if (minWeight) {
    filter.$expr.$and.push({
      $gte: [{ $toDouble: "$specifications.weight" }, Number(minWeight)],
    });
  }
  if (maxWeight) {
    filter.$expr.$and.push({
      $lte: [{ $toDouble: "$specifications.weight" }, Number(maxWeight)],
    });
  }
}

// Stock
if (inStock === "true" || inStock === true) {
  filter.stock = { $gt: 0 };
  filter.isAvailable = true;
}

// On Sale
if (onSale === "true" || onSale === true) {
  filter.discountPrice = { $exists: true, $ne: null };
}

// Low Commission
if (lowCommission === "true" || lowCommission === true) {
  filter["specifications.wage"] = "کم";
}

// Feature flags
if (isFeatured === "true" || isFeatured === true) {
  filter.isFeatured = true;
}
if (isBestSelling === "true" || isBestSelling === true) {
  filter.isBestSelling = true;
}
if (isNewArrival === "true" || isNewArrival === true) {
  filter.isNewArrival = true;
}
if (isGift === "true" || isGift === true) {
  filter.isGift = true;
}
```

### 4️⃣ **Sorting**

```javascript
// Sort mapping
const sortOptions = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  popular: { reviewsCount: -1, rating: -1 },
};

const sort = sortOptions[sortBy] || sortOptions["newest"];
```

### 5️⃣ **Pagination**

```javascript
const pageNum = Math.max(1, Number(page));
const limitNum = Math.min(100, Math.max(1, Number(limit)));
const skip = (pageNum - 1) * limitNum;

// Execute query
const products = await Product.find(filter)
  .sort(sort)
  .skip(skip)
  .limit(limitNum)
  .populate("category", "name slug")
  .populate("subcategory", "name slug");

const totalItems = await Product.countDocuments(filter);
const totalPages = Math.ceil(totalItems / limitNum);
```

### 6️⃣ **Response**

```javascript
res.json({
  data: products,
  pagination: {
    currentPage: pageNum,
    totalPages,
    totalItems,
    itemsPerPage: limitNum,
  },
});
```

---

## 🔄 Database Schema Requirements

مطمئن شوید که schema ای که در MongoDB دارید، این فیلدها رو داره:

```javascript
const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  code: String,
  description: String,
  price: Number,
  discountPrice: Number,
  stock: Number,
  images: [String],

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory",
  },

  specifications: {
    weight: String, // "5.2" (gram)
    karat: String, // "18", "21", "24"
    material: String, // "طلا", "نقره"
    color: String, // "gold", "silver", "rose-gold"
    dimensions: String,
    brand: String, // "Horse Gallery", "برند 2"
    branch: String, // "Horse Gallery", "شعبه 2"
    wage: String, // "کم", "متوسط", "زیاد"
    size: String, // "کوچک", "متوسط", "بزرگ"
    coating: String, // "رودیوم", "طلا", "بدون پوشش"
    coverage: String,
    warranty: String,
  },

  isAvailable: Boolean,
  isFeatured: Boolean,
  isBestSelling: Boolean,
  isNewArrival: Boolean,
  isGift: Boolean,

  rating: Number,
  reviewsCount: Number,

  createdAt: Date,
  updatedAt: Date,
});
```

---

## 🎯 Performance Tips

### 1. Index های مورد نیاز:

```javascript
productSchema.index({ "category.slug": 1 });
productSchema.index({ "subcategory.slug": 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ "specifications.karat": 1 });
productSchema.index({ "specifications.brand": 1 });
productSchema.index({ stock: 1, isAvailable: 1 });
```

### 2. Caching:

- محصولات پرطرفدار رو cache کنید (Redis)
- Filter های پرکاربرد رو cache کنید
- TTL: 5-10 دقیقه

### 3. Optimization:

- از projection استفاده کنید (فقط فیلدهای لازم)
- از lean() استفاده کنید اگر document manipulation نیاز ندارید
- pagination رو محدود کنید (مثلاً max 100 items per page)

---

## ✅ Testing

### Test Cases:

1. ✅ فیلتر بدون هیچ parameter (باید همه محصولات رو برگردونه)
2. ✅ فیلتر با category
3. ✅ فیلتر با price range
4. ✅ فیلتر با چند color
5. ✅ فیلتر با چند karat
6. ✅ فیلتر با brand
7. ✅ فیلتر با weight range
8. ✅ فیلتر با inStock
9. ✅ فیلتر با onSale
10. ✅ فیلتر ترکیبی (چند فیلتر با هم)
11. ✅ sorting با هر option
12. ✅ pagination

---

## 📞 تماس و پشتیبانی

اگر سوالی داشتید یا نیاز به توضیحات بیشتر بود، در تماس باشید.

---

**تاریخ:** 2024  
**نسخه:** 1.0  
**Frontend Developer:** Mahdi
