# 📋 راهنمای Backend: سیستم تخفیف و قیمت‌گذاری

این document شامل تمام تغییرات لازم برای پیاده‌سازی سیستم تخفیف در backend است.

---

## 🎯 خلاصه تغییرات

برای نمایش صحیح تخفیف‌ها در frontend، backend باید:

1. فیلدهای جدید را به Product schema اضافه کند
2. محاسبات خودکار برای درصد تخفیف انجام دهد
3. validation برای قیمت‌ها اعمال کند
4. API response مناسب را برگرداند

---

## 📊 فیلدهای جدید در Product Schema

```javascript
// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // ... فیلدهای موجود (name, slug, code, description, category, etc.)

    // ✅ قیمت اصلی (الزامی)
    price: {
      type: Number,
      required: true,
      min: [0, "قیمت نمی‌تواند منفی باشد"],
    },

    // ✅ قیمت با تخفیف (اختیاری)
    discountPrice: {
      type: Number,
      min: [0, "قیمت تخفیف نمی‌تواند منفی باشد"],
      default: null,
      validate: {
        validator: function (value) {
          // اگر discountPrice وجود دارد، باید کمتر از price باشد
          if (value !== null && value !== undefined) {
            return value < this.price;
          }
          return true;
        },
        message: "قیمت تخفیف باید کمتر از قیمت اصلی باشد",
      },
    },

    // ✅ درصد تخفیف (محاسبه خودکار)
    discount: {
      type: Number,
      min: [0, "درصد تخفیف نمی‌تواند منفی باشد"],
      max: [100, "درصد تخفیف نمی‌تواند بیشتر از 100 باشد"],
      default: 0,
    },

    // ✅ آیا محصول در حال حاضر تخفیف دارد؟ (محاسبه خودکار)
    onSale: {
      type: Boolean,
      default: false,
    },

    // ... سایر فیلدها
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Middleware: محاسبه خودکار discount و onSale قبل از ذخیره
productSchema.pre("save", function (next) {
  // محاسبه درصد تخفیف
  if (this.discountPrice && this.discountPrice < this.price) {
    this.discount = Math.round(
      ((this.price - this.discountPrice) / this.price) * 100
    );
    this.onSale = true;
  } else {
    this.discount = 0;
    this.onSale = false;
    this.discountPrice = null; // اگر discountPrice بزرگتر یا مساوی price باشد، آن را null کن
  }
  next();
});

// ✅ Middleware: محاسبه خودکار برای findOneAndUpdate
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  // اگر price یا discountPrice تغییر کرده، discount را محاسبه کن
  if (update.price !== undefined || update.discountPrice !== undefined) {
    const price = update.price || this.price;
    const discountPrice = update.discountPrice;

    if (discountPrice && discountPrice < price) {
      update.discount = Math.round(((price - discountPrice) / price) * 100);
      update.onSale = true;
    } else {
      update.discount = 0;
      update.onSale = false;
      update.discountPrice = null;
    }

    this.setUpdate(update);
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);
```

---

## 🔧 Controller Functions

### 1. ایجاد یا بروزرسانی محصول (Admin Panel)

```javascript
// controllers/productController.js

/**
 * ایجاد محصول جدید با قابلیت تخفیف
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      code,
      description,
      price,
      discountPrice,
      stock,
      images,
      category,
      subcategory,
      // ... سایر فیلدها
    } = req.body;

    // Validation
    if (!name || !slug || !code || !price) {
      return res.status(400).json({
        success: false,
        message: "فیلدهای الزامی را وارد کنید",
      });
    }

    // بررسی قیمت تخفیف
    if (discountPrice !== null && discountPrice !== undefined) {
      if (discountPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "قیمت تخفیف نمی‌تواند منفی باشد",
        });
      }
      if (discountPrice >= price) {
        return res.status(400).json({
          success: false,
          message: "قیمت تخفیف باید کمتر از قیمت اصلی باشد",
        });
      }
    }

    // ایجاد محصول (discount و onSale به صورت خودکار محاسبه می‌شود)
    const product = await Product.create({
      name,
      slug,
      code,
      description,
      price,
      discountPrice: discountPrice || null,
      stock,
      images,
      category,
      subcategory,
      // ... سایر فیلدها
    });

    res.status(201).json({
      success: true,
      message: "محصول با موفقیت ایجاد شد",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "خطا در ایجاد محصول",
      error: error.message,
    });
  }
};

/**
 * بروزرسانی محصول (با قابلیت تخفیف)
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // بررسی قیمت تخفیف
    if (updates.discountPrice !== undefined) {
      if (updates.discountPrice !== null) {
        const price = updates.price || (await Product.findById(id)).price;

        if (updates.discountPrice < 0) {
          return res.status(400).json({
            success: false,
            message: "قیمت تخفیف نمی‌تواند منفی باشد",
          });
        }
        if (updates.discountPrice >= price) {
          return res.status(400).json({
            success: false,
            message: "قیمت تخفیف باید کمتر از قیمت اصلی باشد",
          });
        }
      }
    }

    // بروزرسانی محصول (discount و onSale به صورت خودکار محاسبه می‌شود)
    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "محصول یافت نشد",
      });
    }

    res.status(200).json({
      success: true,
      message: "محصول با موفقیت بروزرسانی شد",
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "خطا در بروزرسانی محصول",
      error: error.message,
    });
  }
};

/**
 * دریافت لیست محصولات (Public API)
 */
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      sortBy = "newest",
      onSale, // ✅ فیلتر محصولات تخفیف‌دار
      lowCommission,
      // ... سایر فیلترها
    } = req.query;

    // ساخت query
    const query = {};

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;

    // ✅ فیلتر محصولات تخفیف‌دار
    if (onSale === "true" || onSale === "1") {
      query.onSale = true;
    }

    if (lowCommission === "true" || lowCommission === "1") {
      query.lowCommission = true;
    }

    // ... سایر فیلترها

    // ساخت sort
    let sort = {};
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "price-asc":
        sort = { price: 1 };
        break;
      case "price-desc":
        sort = { price: -1 };
        break;
      case "popular":
        sort = { popularityScore: -1 };
        break;
      case "discount": // ✅ مرتب‌سازی بر اساس بیشترین تخفیف
        sort = { discount: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Total count
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت محصولات",
      error: error.message,
    });
  }
};

/**
 * دریافت جزئیات یک محصول
 */
exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug })
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "محصول یافت نشد",
      });
    }

    // افزایش تعداد بازدید
    await Product.findOneAndUpdate({ slug }, { $inc: { viewsCount: 1 } });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت محصول",
      error: error.message,
    });
  }
};
```

---

## 📡 API Response Examples

### دریافت لیست محصولات

**Request:**

```http
GET /api/products?page=1&limit=12
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6742c3a1234567890abcdef1",
      "name": "گردنبند طلا کلاسیک",
      "slug": "classic-gold-necklace",
      "code": "NGN-001",
      "description": "گردنبند زیبا از طلای 18 عیار",
      "price": 5000000,
      "discountPrice": 4000000,
      "discount": 20,
      "onSale": true,
      "stock": 10,
      "images": [
        "/images/products/product1.webp",
        "/images/products/product1-1.webp"
      ],
      "category": {
        "_id": "6742c3a1234567890abcdef2",
        "name": "زنانه",
        "slug": "women"
      },
      "subcategory": {
        "_id": "6742c3a1234567890abcdef3",
        "name": "گردنبند",
        "slug": "necklace"
      },
      "lowCommission": false,
      "commission": 15,
      "wage": "متوسط",
      "salesCount": 25,
      "viewsCount": 150,
      "popularityScore": 275,
      "rating": 4.5,
      "reviewsCount": 12,
      "isFeatured": true,
      "isBestSelling": true,
      "isNewArrival": false,
      "isGift": false,
      "createdAt": "2025-11-20T10:00:00.000Z",
      "updatedAt": "2025-11-27T15:30:00.000Z"
    },
    {
      "_id": "6742c3a1234567890abcdef4",
      "name": "انگشتر نقره زنانه",
      "slug": "silver-ring-women",
      "code": "RSW-005",
      "description": "انگشتر ظریف نقره",
      "price": 800000,
      "discountPrice": null,
      "discount": 0,
      "onSale": false,
      "stock": 20
      // ... سایر فیلدها
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 58,
    "itemsPerPage": 12
  }
}
```

### دریافت محصولات تخفیف‌دار

**Request:**

```http
GET /api/products?onSale=true&limit=12
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6742c3a1234567890abcdef1",
      "name": "گردنبند طلا کلاسیک",
      "price": 5000000,
      "discountPrice": 4000000,
      "discount": 20,
      "onSale": true
      // ... سایر فیلدها
    }
    // فقط محصولاتی که onSale: true دارند
  ],
  "pagination": {
    /* ... */
  }
}
```

### دریافت جزئیات یک محصول

**Request:**

```http
GET /api/products/classic-gold-necklace
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "6742c3a1234567890abcdef1",
    "name": "گردنبند طلا کلاسیک",
    "slug": "classic-gold-necklace",
    "code": "NGN-001",
    "description": "گردنبند زیبا از طلای 18 عیار با طراحی کلاسیک و شیک",
    "price": 5000000,
    "discountPrice": 4000000,
    "discount": 20,
    "onSale": true,
    "stock": 10,
    "images": [
      "/images/products/product1.webp",
      "/images/products/product1-1.webp"
    ],
    "category": {
      "_id": "6742c3a1234567890abcdef2",
      "name": "زنانه",
      "slug": "women"
    },
    "subcategory": {
      "_id": "6742c3a1234567890abcdef3",
      "name": "گردنبند",
      "slug": "necklace"
    },
    "specifications": {
      "weight": "5 گرم",
      "karat": "18 عیار",
      "material": "طلای خالص",
      "dimensions": "45 سانتی‌متر"
    },
    "lowCommission": false,
    "commission": 15,
    "wage": "متوسط",
    "salesCount": 25,
    "viewsCount": 151, // به صورت خودکار +1 شده
    "popularityScore": 276,
    "rating": 4.5,
    "reviewsCount": 12,
    "isFeatured": true,
    "isBestSelling": true,
    "isNewArrival": false,
    "isGift": false,
    "createdAt": "2025-11-20T10:00:00.000Z",
    "updatedAt": "2025-11-27T15:30:00.000Z"
  }
}
```

---

## 🧪 تست API ها

### با curl

```bash
# 1. دریافت تمام محصولات
curl "http://localhost:4001/api/products"

# 2. دریافت محصولات تخفیف‌دار
curl "http://localhost:4001/api/products?onSale=true&limit=12"

# 3. دریافت محصولات تخفیف‌دار مرتب شده بر اساس بیشترین تخفیف
curl "http://localhost:4001/api/products?onSale=true&sortBy=discount&limit=12"

# 4. دریافت جزئیات محصول
curl "http://localhost:4001/api/products/classic-gold-necklace"

# 5. ایجاد محصول با تخفیف (Admin - نیاز به Authentication)
curl -X POST "http://localhost:4001/api/admin/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "گردنبند طلا کلاسیک",
    "slug": "classic-gold-necklace",
    "code": "NGN-001",
    "description": "گردنبند زیبا",
    "price": 5000000,
    "discountPrice": 4000000,
    "stock": 10,
    "images": ["/images/products/product1.webp"],
    "category": "6742c3a1234567890abcdef2",
    "subcategory": "6742c3a1234567890abcdef3"
  }'

# 6. بروزرسانی قیمت تخفیف (Admin)
curl -X PUT "http://localhost:4001/api/admin/products/6742c3a1234567890abcdef1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "discountPrice": 3500000
  }'

# 7. حذف تخفیف (با ست کردن discountPrice به null)
curl -X PUT "http://localhost:4001/api/admin/products/6742c3a1234567890abcdef1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "discountPrice": null
  }'
```

---

## 📊 Database Indexes

برای بهبود performance، این indexها را اضافه کنید:

```javascript
// models/Product.js

// Index برای فیلتر محصولات تخفیف‌دار
productSchema.index({ onSale: 1 });

// Index برای مرتب‌سازی بر اساس تخفیف
productSchema.index({ discount: -1 });

// Compound index برای فیلتر و مرتب‌سازی همزمان
productSchema.index({ onSale: 1, discount: -1 });
productSchema.index({ category: 1, onSale: 1 });
productSchema.index({ subcategory: 1, onSale: 1 });
```

---

## ⚠️ نکات مهم

### 1. محاسبه خودکار

- `discount` و `onSale` به صورت **خودکار** محاسبه می‌شوند
- نیازی نیست در request ارسال شوند
- اگر در request ارسال شوند، توسط middleware override می‌شوند

### 2. Validation

- `discountPrice` باید همیشه کمتر از `price` باشد
- اگر `discountPrice >= price` باشد، به `null` تبدیل می‌شود
- `discount` بین 0 تا 100 است

### 3. Frontend محاسبه نکند

- Frontend **نباید** درصد تخفیف را محاسبه کند
- همیشه از فیلد `discount` برگشتی از API استفاده کند
- این تضمین می‌کند که همه جا یک عدد یکسان نمایش داده شود

### 4. Null vs 0

- اگر محصول تخفیف ندارد:
  - `discountPrice`: `null`
  - `discount`: `0`
  - `onSale`: `false`

### 5. Update کردن قیمت‌ها

- اگر فقط `price` را update کنید، `discount` به صورت خودکار محاسبه مجدد می‌شود
- اگر `discountPrice` را حذف کنید (set به `null`)، `discount` و `onSale` به صورت خودکار `0` و `false` می‌شوند

---

## 🎨 مثال Admin Panel (React/Next.js)

```typescript
// مثال فرم ایجاد/ویرایش محصول در Admin Panel

interface ProductFormData {
  name: string;
  slug: string;
  code: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  // ... سایر فیلدها
}

const ProductForm = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    code: "",
    description: "",
    price: 0,
    discountPrice: null,
    stock: 0,
  });

  const [hasDiscount, setHasDiscount] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (hasDiscount && formData.discountPrice) {
      if (formData.discountPrice >= formData.price) {
        alert("قیمت تخفیف باید کمتر از قیمت اصلی باشد");
        return;
      }
    }

    // ارسال به backend
    const payload = {
      ...formData,
      discountPrice: hasDiscount ? formData.discountPrice : null,
    };

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert("محصول با موفقیت ایجاد شد");
        console.log("Discount:", data.data.discount); // محاسبه شده توسط backend
        console.log("On Sale:", data.data.onSale); // محاسبه شده توسط backend
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... سایر فیلدها */}

      <div>
        <label>قیمت اصلی (تومان)</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: Number(e.target.value) })
          }
          required
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={hasDiscount}
            onChange={(e) => setHasDiscount(e.target.checked)}
          />
          این محصول تخفیف دارد
        </label>
      </div>

      {hasDiscount && (
        <div>
          <label>قیمت با تخفیف (تومان)</label>
          <input
            type="number"
            value={formData.discountPrice || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                discountPrice: Number(e.target.value),
              })
            }
            max={formData.price - 1}
          />
          {formData.discountPrice && formData.price > 0 && (
            <p className="text-sm text-gray-600">
              درصد تخفیف:{" "}
              {Math.round(
                ((formData.price - formData.discountPrice) / formData.price) *
                  100
              )}
              ٪
            </p>
          )}
        </div>
      )}

      <button type="submit">ایجاد محصول</button>
    </form>
  );
};
```

---

## 📝 Checklist پیاده‌سازی Backend

- [ ] اضافه کردن فیلدهای `discountPrice`، `discount`، `onSale` به Product schema
- [ ] اضافه کردن validation برای `discountPrice` (باید کمتر از `price` باشد)
- [ ] اضافه کردن `pre('save')` middleware برای محاسبه خودکار
- [ ] اضافه کردن `pre('findOneAndUpdate')` middleware برای محاسبه خودکار
- [ ] به‌روزرسانی `createProduct` controller
- [ ] به‌روزرسانی `updateProduct` controller
- [ ] اضافه کردن فیلتر `onSale` به `getProducts` controller
- [ ] اضافه کردن sort option `discount` (بیشترین تخفیف)
- [ ] اضافه کردن database indexes
- [ ] تست API endpoints با curl یا Postman
- [ ] تست validation (discountPrice >= price باید error بدهد)
- [ ] تست محاسبه خودکار (discount و onSale)
- [ ] به‌روزرسانی API documentation
- [ ] اطلاع به Frontend team که فیلدهای جدید آماده است

---

## 🚀 Migration (برای محصولات موجود)

اگر قبلاً محصولاتی در database دارید:

```javascript
// scripts/migrate-add-discount-fields.js

const mongoose = require("mongoose");
const Product = require("./models/Product");

async function migrateProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // همه محصولات را به‌روزرسانی کن
    const products = await Product.find({});

    for (const product of products) {
      // محاسبه discount و onSale
      if (product.discountPrice && product.discountPrice < product.price) {
        product.discount = Math.round(
          ((product.price - product.discountPrice) / product.price) * 100
        );
        product.onSale = true;
      } else {
        product.discount = 0;
        product.onSale = false;
        product.discountPrice = null;
      }

      await product.save();
    }

    console.log(`✅ ${products.length} محصول به‌روزرسانی شد`);
    process.exit(0);
  } catch (error) {
    console.error("❌ خطا در migration:", error);
    process.exit(1);
  }
}

migrateProducts();
```

**اجرا:**

```bash
node scripts/migrate-add-discount-fields.js
```

---

## 📞 پشتیبانی

اگر سوال یا مشکلی دارید:

1. ابتدا این document را کامل مطالعه کنید
2. مثال‌های curl را تست کنید
3. validation errors را بررسی کنید
4. با تیم Frontend هماهنگ کنید

**موفق باشید! 🚀**
