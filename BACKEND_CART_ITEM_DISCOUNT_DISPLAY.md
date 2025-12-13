# 🏷️ نمایش Badge تخفیف و قیمت‌ها در صفحه پرداخت - Backend

**تاریخ:** دسامبر 2024  
**وضعیت:** ⚠️ نیاز به بررسی در Backend

---

## 📋 خلاصه

برای نمایش badge تخفیف و قیمت‌های اصلی و با تخفیف در صفحه پرداخت، Frontend نیاز به فیلدهای زیر از Backend دارد:

---

## 📝 فیلدهای مورد نیاز در CartItem Response

### ✅ فیلدهای موجود (قبلاً پیاده‌سازی شده):

```typescript
interface CartItem {
  _id: string;
  product: CartItemProduct;
  quantity: number;
  size?: string;

  // ✅ این فیلدها از قبل وجود دارند:
  price: number; // ✅ قیمت کل (با تخفیف) برای quantity فعلی
  originalPrice: number; // ✅ قیمت کل اصلی (بدون تخفیف) برای quantity فعلی
  unitPrice: number; // ✅ قیمت واحد (با تخفیف)
  unitOriginalPrice: number; // ✅ قیمت واحد اصلی (بدون تخفیف)
  discount: number; // ✅ درصد تخفیف (0-100)

  createdAt: string;
  updatedAt: string;
}
```

---

## 🎯 استفاده در Frontend

### 1️⃣ Badge تخفیف روی عکس محصول:

```typescript
// اگر discount > 0 باشد، badge نمایش داده می‌شود
{
  item.discount && item.discount > 0 && (
    <div className="absolute top-1 right-1 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
      {item.discount}٪
    </div>
  );
}
```

### 2️⃣ نمایش قیمت‌ها:

```typescript
// اگر originalPrice > price باشد، تخفیف دارد
{
  item.originalPrice > item.price ? (
    <div className="flex items-baseline gap-1.5">
      <span className="text-base font-bold text-red-600">
        {item.price.toLocaleString("fa-IR")} تومان
      </span>
      <span className="text-xs text-gray-400 line-through">
        {item.originalPrice.toLocaleString("fa-IR")} تومان
      </span>
    </div>
  ) : (
    <span className="text-base font-bold text-gray-900">
      {item.price.toLocaleString("fa-IR")} تومان
    </span>
  );
}
```

---

## ✅ چک‌لیست Backend

### بررسی کنید که:

- [x] `discount` در `CartItem` محاسبه و برگردانده می‌شود ✅
- [x] `price` (قیمت با تخفیف) برای quantity فعلی محاسبه می‌شود ✅
- [x] `originalPrice` (قیمت اصلی) برای quantity فعلی محاسبه می‌شود ✅
- [x] `unitPrice` (قیمت واحد با تخفیف) محاسبه می‌شود ✅
- [x] `unitOriginalPrice` (قیمت واحد اصلی) محاسبه می‌شود ✅

---

## 📊 مثال Response

### محصول با تخفیف:

```json
{
  "items": [
    {
      "_id": "item_123",
      "product": {
        "_id": "product_456",
        "name": "دستبند طلا",
        "slug": "dastband-tala",
        "code": "PRD-001",
        "price": 6000000,
        "discountPrice": 5000000,
        "images": ["/images/products/product1.webp"]
      },
      "quantity": 2,
      "size": "16",
      "price": 10000000, // ✅ 2 * 5000000 (با تخفیف)
      "originalPrice": 12000000, // ✅ 2 * 6000000 (بدون تخفیف)
      "unitPrice": 5000000, // ✅ قیمت واحد با تخفیف
      "unitOriginalPrice": 6000000, // ✅ قیمت واحد اصلی
      "discount": 16 // ✅ درصد تخفیف
    }
  ]
}
```

### محصول بدون تخفیف:

```json
{
  "items": [
    {
      "_id": "item_124",
      "product": {
        "_id": "product_789",
        "name": "گردنبند طلا",
        "slug": "gardanband-tala",
        "code": "PRD-002",
        "price": 8000000,
        "discountPrice": null,
        "images": ["/images/products/product2.webp"]
      },
      "quantity": 1,
      "price": 8000000, // ✅ 1 * 8000000
      "originalPrice": 8000000, // ✅ 1 * 8000000
      "unitPrice": 8000000, // ✅ قیمت واحد
      "unitOriginalPrice": 8000000, // ✅ قیمت واحد
      "discount": 0 // ✅ بدون تخفیف
    }
  ]
}
```

---

## ⚠️ نکات مهم

### 1. محاسبه `discount`:

- ✅ باید از `product.price` و `product.discountPrice` محاسبه شود
- ✅ فرمول: `Math.round(((price - discountPrice) / price) * 100)`
- ✅ اگر `discountPrice === null` یا `discountPrice >= price`، باید `discount = 0` باشد

### 2. محاسبه `price` و `originalPrice`:

- ✅ `price = (product.discountPrice || product.price) * quantity`
- ✅ `originalPrice = product.price * quantity`
- ✅ اگر `discountPrice === null`، `price = originalPrice`

### 3. محاسبه `unitPrice` و `unitOriginalPrice`:

- ✅ `unitPrice = product.discountPrice || product.price`
- ✅ `unitOriginalPrice = product.price`

---

## 🧪 تست

### تست 1: محصول با تخفیف

```bash
GET /site/cart
```

**بررسی Response:**

```json
{
  "items": [
    {
      "price": 10000000, // ✅ باید 2 * 5000000 باشد
      "originalPrice": 12000000, // ✅ باید 2 * 6000000 باشد
      "unitPrice": 5000000, // ✅ باید 5000000 باشد
      "unitOriginalPrice": 6000000, // ✅ باید 6000000 باشد
      "discount": 16 // ✅ باید 16 باشد
    }
  ]
}
```

---

## 🎯 خلاصه

### ✅ Backend باید:

1. **`discount` را برای هر CartItem محاسبه کند**
2. **`price` و `originalPrice` را برای quantity فعلی محاسبه کند**
3. **`unitPrice` و `unitOriginalPrice` را محاسبه کند**
4. **این فیلدها را در همه Cart API responses برگرداند**

### ✅ Frontend انجام می‌دهد:

1. **Badge تخفیف را روی عکس محصول نمایش می‌دهد** (اگر `discount > 0`)
2. **قیمت با تخفیف و قیمت اصلی را نمایش می‌دهد** (اگر `originalPrice > price`)
3. **فقط مقادیر از Backend را نمایش می‌دهد** (بدون محاسبه)

---

## 📞 پشتیبانی

اگر مشکلی داشتید:

1. ✅ بررسی کنید که همه فیلدها در `CartItem` response وجود دارند
2. ✅ بررسی کنید که محاسبات درست انجام می‌شود
3. ✅ Response را در Console/Network tab بررسی کنید

---

**موفق باشید! 🎉**
