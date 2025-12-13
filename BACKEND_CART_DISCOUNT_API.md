# 🛒 نمایش Badge و قیمت تخفیف در Drawer سبد خرید - Backend

**تاریخ:** دسامبر 2024  
**وضعیت:** ⚠️ نیاز به پیاده‌سازی در Backend

---

## 📋 خلاصه

برای نمایش **Badge تخفیف** و **قیمت با تخفیف** در Drawer سبد خرید، Backend باید فیلدهای زیر را در response Cart API برگرداند:

- ✅ `discount`: درصد تخفیف (عدد)
- ✅ `originalPrice`: قیمت اصلی محصول بدون تخفیف (عدد)
- ✅ `price`: قیمت نهایی با تخفیف (عدد) - **قبلاً وجود دارد**

---

## 🎯 نیاز Frontend

Frontend نیاز دارد که در response Cart API، برای هر `CartItem` این اطلاعات را دریافت کند:

```typescript
interface CartItem {
  _id: string;
  product: CartItemProduct;
  quantity: number;
  size?: string;
  price: number; // ✅ قیمت نهایی (با تخفیف) - قبلاً وجود دارد
  originalPrice?: number; // ⚠️ قیمت اصلی (بدون تخفیف) - نیاز به اضافه شدن
  discount?: number; // ⚠️ درصد تخفیف - نیاز به اضافه شدن
  createdAt: string;
  updatedAt: string;
}
```

---

## 📝 تغییرات مورد نیاز در Backend

### 1️⃣ Response Cart API

**Endpoint:** `GET /site/cart`  
**Endpoint:** `POST /site/cart`  
**Endpoint:** `PUT /site/cart/items/:itemId`  
**Endpoint:** `DELETE /site/cart/items/:itemId`

#### Response Structure:

```json
{
  "cart": {
    "_id": "cart_123456",
    "user": "user_789",
    "sessionId": null,
    ...
  },
  "items": [
    {
      "_id": "item_1",
      "product": {
        "_id": "product_123",
        "name": "دستبند طلا",
        "slug": "dastband-tala",
        "code": "PRD-001",
        "price": 6000000,           // قیمت اصلی محصول
        "discountPrice": 5000000,  // قیمت با تخفیف محصول (اختیاری)
        "images": [...],
        "stock": 10,
        "productType": "jewelry",
        "goldInfo": {...}
      },
      "quantity": 2,
      "size": "16",
      "price": 10000000,           // ✅ قیمت نهایی (با تخفیف) = discountPrice * quantity
      "originalPrice": 12000000,   // ⚠️ قیمت اصلی (بدون تخفیف) = price * quantity
      "discount": 16,               // ⚠️ درصد تخفیف (محاسبه شده)
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T11:00:00Z"
    }
  ],
  "itemCount": 1,
  "totalItems": 2,
  "totalPrice": 10000000,
  ...
}
```

---

## 🔢 منطق محاسبه

### برای هر CartItem:

```typescript
// 1. محاسبه قیمت اصلی (بدون تخفیف)
const originalPrice = product.price * quantity;

// 2. محاسبه قیمت نهایی (با تخفیف)
const finalPrice = (product.discountPrice || product.price) * quantity;

// 3. محاسبه درصد تخفیف
let discount = 0;
if (product.discountPrice && product.discountPrice < product.price) {
  discount = Math.round(
    ((product.price - product.discountPrice) / product.price) * 100
  );
}

// 4. ساخت CartItem
const cartItem = {
  _id: item._id,
  product: product,
  quantity: quantity,
  size: item.size,
  price: finalPrice, // قیمت نهایی (با تخفیف)
  originalPrice: originalPrice, // قیمت اصلی (بدون تخفیف)
  discount: discount, // درصد تخفیف
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
};
```

---

## 📊 مثال‌های مختلف

### مثال 1: محصول با تخفیف

```json
{
  "product": {
    "price": 6000000, // قیمت اصلی
    "discountPrice": 5000000 // قیمت با تخفیف
  },
  "quantity": 2,
  "price": 10000000, // 5000000 * 2
  "originalPrice": 12000000, // 6000000 * 2
  "discount": 16 // ((6000000 - 5000000) / 6000000) * 100
}
```

### مثال 2: محصول بدون تخفیف

```json
{
  "product": {
    "price": 6000000,
    "discountPrice": null // یا undefined
  },
  "quantity": 2,
  "price": 12000000, // 6000000 * 2
  "originalPrice": 12000000, // 6000000 * 2 (برابر با price)
  "discount": 0 // یا null
}
```

### مثال 3: محصول با تخفیف 50%

```json
{
  "product": {
    "price": 10000000,
    "discountPrice": 5000000
  },
  "quantity": 1,
  "price": 5000000, // 5000000 * 1
  "originalPrice": 10000000, // 10000000 * 1
  "discount": 50 // ((10000000 - 5000000) / 10000000) * 100
}
```

---

## ⚠️ نکات مهم

### 1. محاسبه در Backend

- ✅ **همه محاسبات باید در Backend انجام شود**
- ✅ Frontend فقط داده‌ها را نمایش می‌دهد
- ✅ درصد تخفیف باید از Backend محاسبه و ارسال شود

### 2. فیلدهای اختیاری

- `originalPrice`: اگر محصول تخفیف ندارد، می‌تواند `null` باشد یا برابر با `price`
- `discount`: اگر محصول تخفیف ندارد، باید `0` یا `null` باشد

### 3. سازگاری با کد فعلی

- اگر `discount` وجود نداشته باشد یا `0` باشد، Frontend badge تخفیف را نمایش نمی‌دهد
- اگر `originalPrice` وجود نداشته باشد یا برابر با `price` باشد، Frontend فقط قیمت نهایی را نمایش می‌دهد

---

## 🧪 تست

### تست 1: محصول با تخفیف

```bash
# افزودن محصول با تخفیف به سبد
POST /site/cart
{
  "productId": "product_with_discount",
  "quantity": 2
}

# بررسی Response
{
  "items": [{
    "price": 10000000,        // باید قیمت با تخفیف باشد
    "originalPrice": 12000000, // باید قیمت اصلی باشد
    "discount": 16            // باید درصد تخفیف باشد
  }]
}
```

### تست 2: محصول بدون تخفیف

```bash
# افزودن محصول بدون تخفیف به سبد
POST /site/cart
{
  "productId": "product_without_discount",
  "quantity": 1
}

# بررسی Response
{
  "items": [{
    "price": 6000000,         // باید قیمت اصلی باشد
    "originalPrice": 6000000, // باید برابر با price باشد
    "discount": 0             // باید 0 باشد
  }]
}
```

---

## 📝 چک‌لیست پیاده‌سازی

- [ ] اضافه کردن فیلد `discount` به `CartItem` در response
- [ ] اضافه کردن فیلد `originalPrice` به `CartItem` در response
- [ ] محاسبه `discount` از `product.price` و `product.discountPrice`
- [ ] محاسبه `originalPrice` از `product.price * quantity`
- [ ] محاسبه `price` از `(product.discountPrice || product.price) * quantity`
- [ ] تست با محصولات با تخفیف
- [ ] تست با محصولات بدون تخفیف
- [ ] تست با quantity های مختلف

---

## 🎨 نحوه استفاده در Frontend

بعد از پیاده‌سازی در Backend، Frontend به صورت خودکار:

1. ✅ **Badge تخفیف** را روی تصویر محصول نمایش می‌دهد (اگر `discount > 0`)
2. ✅ **قیمت با تخفیف** (قرمز) و **قیمت اصلی** (خط‌خورده) را نمایش می‌دهد (اگر `originalPrice > price`)

---

## 📞 پشتیبانی

اگر مشکلی داشتید:

1. ✅ بررسی کنید که `discount` و `originalPrice` در response وجود دارند
2. ✅ بررسی کنید که محاسبات درست انجام می‌شود
3. ✅ Response را در Console/Network tab بررسی کنید

---

**موفق باشید! 🎉**
