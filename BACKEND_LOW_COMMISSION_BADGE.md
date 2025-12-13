# 🏷️ Badge سبز "کم اجرت" برای محصولات - Backend

**تاریخ:** دسامبر 2024  
**وضعیت:** ⚠️ نیاز به بررسی در Backend

---

## 📋 خلاصه

برای نمایش badge سبز "کم اجرت" روی محصولات در بخش "پیشنهادات ویژه ما (کم اجرت)"، Frontend نیاز به فیلد `lowCommission` از Backend دارد.

---

## 📝 فیلد مورد نیاز در Product API Response

### ✅ فیلد موجود (باید بررسی شود):

```typescript
interface Product {
  _id: string;
  name: string;
  slug: string;
  code: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  category: {...};

  // ⚠️ این فیلد باید در همه Product API responses برگردانده شود:
  lowCommission?: boolean; // ✅ آیا محصول اجرت کم دارد؟ (پیشنهاد ویژه)

  // سایر فیلدها...
}
```

---

## 🎯 استفاده در Frontend

### 1️⃣ Badge سبز "کم اجرت" روی عکس محصول:

```typescript
// در ProductCard component
{
  /* Low Commission Badge - پیشنهاد ویژه (کم اجرت) */
}
{
  /* فقط اگر تخفیف نداشته باشد نمایش داده می‌شود */
}
{
  product.lowCommission &&
    (!product.onSale || !product.discount || product.discount === 0) && (
      <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
        کم اجرت
      </div>
    );
}
```

### 2️⃣ اولویت Badge ها:

1. **اولویت اول: Badge تخفیف (قرمز)**

   - اگر `onSale === true` و `discount > 0` باشد
   - Badge قرمز با متن "{discount}% تخفیف"

2. **اولویت دوم: Badge کم اجرت (سبز)**
   - اگر `lowCommission === true` و تخفیف نداشته باشد
   - Badge سبز با متن "کم اجرت"

---

## 📊 مثال Response

### محصول با کم اجرت (بدون تخفیف):

```json
{
  "product": {
    "_id": "product_123",
    "name": "گردنبند طلا",
    "slug": "gold-necklace",
    "price": 6000000,
    "discountPrice": null,
    "onSale": false,
    "discount": 0,
    "lowCommission": true,  // ✅ باید true باشد
    "images": [...],
    "stock": 10,
    "category": {...}
  }
}
```

### محصول با کم اجرت و تخفیف:

```json
{
  "product": {
    "_id": "product_456",
    "name": "دستبند طلا",
    "slug": "gold-bracelet",
    "price": 6000000,
    "discountPrice": 5000000,
    "onSale": true,
    "discount": 16,
    "lowCommission": true,  // ✅ اگر تخفیف داشته باشد، badge کم اجرت نمایش داده نمی‌شود
    "images": [...],
    "stock": 10,
    "category": {...}
  }
}
```

### محصول بدون کم اجرت:

```json
{
  "product": {
    "_id": "product_789",
    "name": "انگشتر طلا",
    "slug": "gold-ring",
    "price": 4000000,
    "discountPrice": null,
    "onSale": false,
    "discount": 0,
    "lowCommission": false,  // ✅ یا null/undefined
    "images": [...],
    "stock": 10,
    "category": {...}
  }
}
```

---

## ⚠️ نکات مهم

### 1. محاسبه `lowCommission` در Backend:

- ✅ **باید در Backend محاسبه شود**
- ✅ **باید در همه Product API responses برگردانده شود**
- ✅ **مقدار boolean است** (`true` یا `false`)

### 2. منطق نمایش Badge:

- ✅ **اگر محصول تخفیف داشته باشد** (`onSale === true` و `discount > 0`):

  - فقط badge تخفیف (قرمز) نمایش داده می‌شود
  - badge کم اجرت نمایش داده نمی‌شود

- ✅ **اگر محصول تخفیف نداشته باشد** و `lowCommission === true`:
  - badge کم اجرت (سبز) نمایش داده می‌شود

---

## 📝 چک‌لیست پیاده‌سازی Backend

### برای Product API:

- [ ] اضافه کردن فیلد `lowCommission` به Product response
- [ ] محاسبه `lowCommission` بر اساس منطق کسب‌وکار
- [ ] برگرداندن `lowCommission` در همه Product API responses:
  - `GET /product/public`
  - `GET /product/public/:slug`
  - `GET /product/public/search`
  - `GET /site/product`
  - `GET /site/product/:url`
- [ ] تست با محصولات با کم اجرت
- [ ] تست با محصولات بدون کم اجرت
- [ ] تست با محصولات با کم اجرت و تخفیف

---

## 🧪 تست

### تست 1: محصول با کم اجرت (بدون تخفیف)

```bash
GET /product/public/product-with-low-commission
```

**بررسی Response:**

```json
{
  "product": {
    "price": 6000000,
    "discountPrice": null,
    "onSale": false,
    "discount": 0,
    "lowCommission": true // ✅ باید true باشد
  }
}
```

**نتیجه Frontend:**

- ✅ Badge سبز "کم اجرت" نمایش داده می‌شود

---

### تست 2: محصول با کم اجرت و تخفیف

```bash
GET /product/public/product-with-low-commission-and-discount
```

**بررسی Response:**

```json
{
  "product": {
    "price": 6000000,
    "discountPrice": 5000000,
    "onSale": true,
    "discount": 16,
    "lowCommission": true // ✅ true است اما badge نمایش داده نمی‌شود
  }
}
```

**نتیجه Frontend:**

- ✅ Badge قرمز "{discount}% تخفیف" نمایش داده می‌شود
- ❌ Badge سبز "کم اجرت" نمایش داده نمی‌شود (چون تخفیف دارد)

---

### تست 3: محصول بدون کم اجرت

```bash
GET /product/public/product-without-low-commission
```

**بررسی Response:**

```json
{
  "product": {
    "price": 6000000,
    "discountPrice": null,
    "onSale": false,
    "discount": 0,
    "lowCommission": false // ✅ باید false باشد
  }
}
```

**نتیجه Frontend:**

- ❌ هیچ badge‌ای نمایش داده نمی‌شود

---

### تست 4: لیست محصولات (پیشنهادات ویژه)

```bash
GET /product/public?lowCommission=true
```

**بررسی Response:**

```json
{
  "data": [
    {
      "price": 6000000,
      "discountPrice": null,
      "onSale": false,
      "discount": 0,
      "lowCommission": true // ✅ باید true باشد
    },
    {
      "price": 8000000,
      "discountPrice": null,
      "onSale": false,
      "discount": 0,
      "lowCommission": false // ✅ باید false باشد
    }
  ]
}
```

---

## 🎯 خلاصه

### ✅ Backend باید:

1. **`lowCommission` را برای هر محصول محاسبه کند**
2. **این فیلد را در همه Product API responses برگرداند**
3. **مقدار boolean برگرداند** (`true` یا `false`)

### ✅ Frontend انجام می‌دهد:

1. **Badge سبز "کم اجرت" را روی عکس محصول نمایش می‌دهد** (اگر `lowCommission === true` و تخفیف نداشته باشد)
2. **اولویت را رعایت می‌کند** (اگر تخفیف داشته باشد، فقط badge تخفیف نمایش داده می‌شود)
3. **فقط مقادیر از Backend را نمایش می‌دهد** (بدون محاسبه)

---

## 📞 پشتیبانی

اگر مشکلی داشتید:

1. ✅ بررسی کنید که `lowCommission` در Product API response وجود دارد
2. ✅ بررسی کنید که مقدار boolean است (`true` یا `false`)
3. ✅ Response را در Console/Network tab بررسی کنید

---

**موفق باشید! 🎉**
