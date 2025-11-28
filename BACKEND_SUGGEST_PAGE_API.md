# 📋 API Documentation for Suggest Page (صفحه پیشنهادات ویژه)

این document مربوط به API های مورد نیاز برای صفحه **پیشنهادات ویژه** (`/suggest`) است.

---

## 🎯 خلاصه

صفحه پیشنهادات ویژه نیاز به سه نوع داده دارد:
1. **محصولات تخفیف‌دار** (Sale Products)
2. **پیشنهادات ویژه با اجرت کم** (Special Offers - Low Commission)
3. **محصولات پرفروش** (Popular Products)

همه این درخواست‌ها از همان endpoint موجود محصولات استفاده می‌کنند، فقط با **فیلترها و پارامترهای متفاوت**.

---

## 📡 API Endpoint

```
GET /api/products
```

این همان endpoint موجود است که برای لیست محصولات استفاده می‌شود.

---

## 🔧 پارامترهای جدید مورد نیاز

### **1. Parameter: `onSale`**

برای فیلتر کردن محصولاتی که در حال حاضر تخفیف دارند.

**Type:** `boolean`  
**Required:** No  
**Default:** `undefined` (همه محصولات)

**Example:**
```
GET /api/products?onSale=true
```

**Backend Logic:**
```javascript
// MongoDB Query
if (onSale === true) {
  query.onSale = true;
  // یا اگر فیلد دیگری دارید:
  // query.discount = { $gt: 0 }
}
```

**Schema Field مورد نیاز:**
```javascript
{
  onSale: {
    type: Boolean,
    default: false,
    index: true  // برای performance بهتر
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100  // درصد تخفیف (0-100)
  }
}
```

---

### **2. Parameter: `lowCommission`**

برای فیلتر کردن محصولاتی که اجرت کم دارند (پیشنهادات ویژه).

**Type:** `boolean`  
**Required:** No  
**Default:** `undefined`

**Example:**
```
GET /api/products?lowCommission=true
```

**Backend Logic:**
```javascript
// MongoDB Query
if (lowCommission === true) {
  query.lowCommission = true;
  // یا اگر می‌خواهید بر اساس مقدار عددی:
  // query.commission = { $lte: 5 }  // اجرت کمتر از 5 درصد
}
```

**Schema Field مورد نیاز:**
```javascript
{
  lowCommission: {
    type: Boolean,
    default: false,
    index: true
  },
  commission: {
    type: Number,
    default: 0,
    min: 0  // درصد اجرت
  }
}
```

---

### **3. Parameter: `sortBy=popular`**

برای مرتب‌سازی بر اساس محبوبیت (تعداد فروش، تعداد بازدید، امتیاز).

**Type:** `string`  
**Values:** `"popular"`, `"newest"`, `"oldest"`, `"price-low"`, `"price-high"`  
**Required:** No  
**Default:** `undefined` (newest)

**Example:**
```
GET /api/products?sortBy=popular
```

**Backend Logic:**
```javascript
// Sort Options
const sortOptions = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  'price-low': { price: 1 },
  'price-high': { price: -1 },
  popular: { 
    // گزینه 1: بر اساس تعداد فروش
    salesCount: -1,
    // یا گزینه 2: بر اساس تعداد بازدید
    // viewsCount: -1,
    // یا گزینه 3: ترکیبی
    // popularityScore: -1
  }
};

const sort = sortOptions[sortBy] || sortOptions.newest;
```

**Schema Fields مورد نیاز:**
```javascript
{
  salesCount: {
    type: Number,
    default: 0,
    index: true  // برای sort سریع‌تر
  },
  viewsCount: {
    type: Number,
    default: 0,
    index: true
  },
  popularityScore: {
    type: Number,
    default: 0,
    index: true
    // می‌تونید این رو با فرمول محاسبه کنید:
    // popularityScore = (salesCount * 5) + (viewsCount * 1) + (rating * 10)
  }
}
```

---

## 📊 نمونه درخواست‌های Frontend

### **1. دریافت محصولات تخفیف‌دار**

```javascript
// Frontend Request
const saleProducts = await getProducts({ 
  onSale: true, 
  limit: 12 
});
```

**Backend URL:**
```
GET /api/products?onSale=true&limit=12
```

**Response مورد انتظار:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "گردنبند طلا",
      "price": 50000000,
      "discount": 25,
      "onSale": true,
      "images": ["image1.jpg", "image2.jpg"],
      "slug": "gold-necklace",
      "category": {
        "slug": "women"
      }
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 12
}
```

---

### **2. دریافت پیشنهادات ویژه (اجرت کم)**

```javascript
// Frontend Request
const specialProducts = await getProducts({ 
  lowCommission: true, 
  limit: 12 
});
```

**Backend URL:**
```
GET /api/products?lowCommission=true&limit=12
```

**Response مورد انتظار:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "name": "دستبند طلا",
      "price": 30000000,
      "lowCommission": true,
      "commission": 3,
      "images": ["image1.jpg"],
      "slug": "gold-bracelet",
      "category": {
        "slug": "women"
      }
    }
  ],
  "total": 28,
  "page": 1,
  "limit": 12
}
```

---

### **3. دریافت محصولات پرفروش**

```javascript
// Frontend Request
const popularProducts = await getProducts({ 
  sortBy: "popular", 
  limit: 8 
});
```

**Backend URL:**
```
GET /api/products?sortBy=popular&limit=8
```

**Response مورد انتظار:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "name": "انگشتر طلا",
      "price": 15000000,
      "salesCount": 150,
      "viewsCount": 2500,
      "popularityScore": 3250,
      "images": ["image1.jpg"],
      "slug": "gold-ring",
      "category": {
        "slug": "women"
      }
    }
  ],
  "total": 200,
  "page": 1,
  "limit": 8
}
```

---

## 🗄️ تغییرات Schema محصول

به schema محصول (`Product Model`) این فیلدها رو اضافه کنید:

```javascript
const ProductSchema = new mongoose.Schema({
  // ... فیلدهای موجود

  // برای تخفیف‌ها
  onSale: {
    type: Boolean,
    default: false,
    index: true,
    description: "آیا محصول در حال حاضر تخفیف دارد؟"
  },
  
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    description: "درصد تخفیف (0-100)"
  },

  // برای پیشنهادات ویژه
  lowCommission: {
    type: Boolean,
    default: false,
    index: true,
    description: "آیا محصول اجرت کم دارد؟"
  },
  
  commission: {
    type: Number,
    default: 0,
    min: 0,
    description: "درصد اجرت"
  },

  // برای محبوبیت
  salesCount: {
    type: Number,
    default: 0,
    index: true,
    description: "تعداد فروش"
  },
  
  viewsCount: {
    type: Number,
    default: 0,
    index: true,
    description: "تعداد بازدید"
  },
  
  popularityScore: {
    type: Number,
    default: 0,
    index: true,
    description: "امتیاز محبوبیت (محاسبه شده)"
  }
}, {
  timestamps: true
});

// Index ترکیبی برای query های بهتر
ProductSchema.index({ onSale: 1, createdAt: -1 });
ProductSchema.index({ lowCommission: 1, createdAt: -1 });
ProductSchema.index({ popularityScore: -1 });
```

---

## 🔄 به‌روزرسانی Controller

```javascript
// controllers/productController.js

exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      page = 1,
      limit = 18,
      sortBy,
      minPrice,
      maxPrice,
      colors,
      karats,
      brands,
      branches,
      wages,
      sizes,
      coatings,
      minWeight,
      maxWeight,
      inStock,
      onSale,        // جدید ✅
      lowCommission, // جدید ✅
      // ... سایر فیلترها
    } = req.query;

    // Build query
    let query = {};

    // فیلترهای موجود
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    
    // فیلترهای جدید ✅
    if (onSale === 'true') {
      query.onSale = true;
    }
    
    if (lowCommission === 'true') {
      query.lowCommission = true;
    }

    // ... سایر فیلترها

    // Sort options
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 },
      popular: { popularityScore: -1 }, // جدید ✅
    };

    const sort = sortOptions[sortBy] || sortOptions.newest;

    // Execute query
    const products = await Product.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('category', 'slug')
      .exec();

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      total,
      page: Number(page),
      limit: Number(limit),
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت محصولات',
      error: error.message,
    });
  }
};
```

---

## 📈 محاسبه Popularity Score

برای محاسبه امتیاز محبوبیت، می‌تونید یک Middleware یا Cron Job بنویسید:

```javascript
// utils/calculatePopularity.js

async function updatePopularityScores() {
  const products = await Product.find({});
  
  for (const product of products) {
    // فرمول محاسبه:
    // هر فروش = 5 امتیاز
    // هر بازدید = 1 امتیاز
    // هر ستاره rating = 10 امتیاز
    
    const score = 
      (product.salesCount * 5) + 
      (product.viewsCount * 1) + 
      (product.rating * 10);
    
    product.popularityScore = score;
    await product.save();
  }
  
  console.log('Popularity scores updated successfully');
}

// اجرای هر 24 ساعت یک بار
setInterval(updatePopularityScores, 24 * 60 * 60 * 1000);
```

---

## 🎯 افزایش تعداد فروش و بازدید

### **1. افزایش تعداد بازدید:**

```javascript
// در صفحه جزئیات محصول
exports.getProductDetail = async (req, res) => {
  const { slug } = req.params;
  
  const product = await Product.findOneAndUpdate(
    { slug },
    { $inc: { viewsCount: 1 } }, // افزایش 1 واحد ✅
    { new: true }
  );
  
  res.json({ success: true, data: product });
};
```

### **2. افزایش تعداد فروش:**

```javascript
// بعد از تکمیل خرید
exports.completeOrder = async (req, res) => {
  const { orderId } = req.params;
  
  const order = await Order.findById(orderId);
  
  // افزایش تعداد فروش برای هر محصول
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { salesCount: 1 } } // افزایش 1 واحد ✅
    );
  }
  
  res.json({ success: true });
};
```

---

## 🧪 تست API ها

### **Test 1: محصولات تخفیف‌دار**
```bash
curl "http://localhost:5000/api/products?onSale=true&limit=12"
```

### **Test 2: پیشنهادات ویژه**
```bash
curl "http://localhost:5000/api/products?lowCommission=true&limit=12"
```

### **Test 3: محصولات پرفروش**
```bash
curl "http://localhost:5000/api/products?sortBy=popular&limit=8"
```

### **Test 4: ترکیبی**
```bash
curl "http://localhost:5000/api/products?category=women&onSale=true&sortBy=popular&limit=10"
```

---

## ⚡ بهینه‌سازی Performance

### **1. Indexes:**
```javascript
ProductSchema.index({ onSale: 1, createdAt: -1 });
ProductSchema.index({ lowCommission: 1, createdAt: -1 });
ProductSchema.index({ popularityScore: -1 });
ProductSchema.index({ category: 1, onSale: 1 });
```

### **2. Caching:**
```javascript
// محصولات پرفروش رو cache کنید (Redis)
const cacheKey = `popular_products_${limit}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const products = await Product.find({ ... });
await redis.setex(cacheKey, 3600, JSON.stringify(products)); // 1 hour
```

---

## 📝 خلاصه تغییرات Backend

### ✅ **Schema:**
- اضافه کردن فیلدهای: `onSale`, `discount`, `lowCommission`, `commission`, `salesCount`, `viewsCount`, `popularityScore`
- اضافه کردن Index ها

### ✅ **Controller:**
- پشتیبانی از پارامترهای: `onSale`, `lowCommission`
- اضافه کردن گزینه `sortBy=popular`

### ✅ **Logic:**
- افزایش `viewsCount` در صفحه جزئیات
- افزایش `salesCount` بعد از خرید موفق
- محاسبه `popularityScore` (اختیاری)

### ✅ **Performance:**
- اضافه کردن Index های مناسب
- استفاده از Cache برای محصولات پرفروش

---

## 📞 تماس و پشتیبانی

اگر سوال یا ابهامی در مورد پیاده‌سازی دارید، حتماً اطلاع دهید.

**موفق باشید! 🚀**

