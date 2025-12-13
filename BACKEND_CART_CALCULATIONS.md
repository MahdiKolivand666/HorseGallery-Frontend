# 🧮 محاسبات سبد خرید - Backend

**تاریخ:** دسامبر 2024  
**وضعیت:** ⚠️ نیاز به پیاده‌سازی در Backend

---

## 📋 خلاصه

**همه محاسبات مربوط به سبد خرید باید در Backend انجام شود.** Frontend فقط داده‌های محاسبه شده را از Backend دریافت می‌کند و نمایش می‌دهد.

**هیچ محاسبه‌ای نباید در Frontend انجام شود.**

---

## 🎯 اصل کلی

### ❌ Frontend نباید:

- محاسبه قیمت نهایی (`price * quantity`)
- محاسبه قیمت اصلی (`originalPrice * quantity`)
- محاسبه درصد تخفیف
- محاسبه مجموع قیمت‌ها
- محاسبه تایمر (remainingSeconds)
- هرگونه محاسبه ریاضی

### ✅ Backend باید:

- همه محاسبات را انجام دهد
- مقادیر محاسبه شده را در response برگرداند
- Frontend فقط این مقادیر را نمایش می‌دهد

---

## 📝 فیلدهای مورد نیاز در Response

### 1️⃣ CartItem (برای هر آیتم)

```typescript
interface CartItem {
  _id: string;
  product: CartItemProduct;
  quantity: number;
  size?: string;

  // ⚠️ همه این فیلدها باید از Backend محاسبه و ارسال شوند:
  price: number; // قیمت نهایی (با تخفیف) برای quantity فعلی
  originalPrice?: number; // قیمت اصلی (بدون تخفیف) برای quantity فعلی
  discount?: number; // درصد تخفیف (محاسبه شده)

  createdAt: string;
  updatedAt: string;
}
```

### 2️⃣ CartResponse (برای کل سبد)

```typescript
interface CartResponse {
  cart: Cart | null;
  items: CartItem[];

  // ⚠️ همه این فیلدها باید از Backend محاسبه و ارسال شوند:
  itemCount: number; // تعداد آیتم‌های مختلف
  totalItems: number; // مجموع quantity همه آیتم‌ها
  totalPrice: number; // مجموع قیمت نهایی همه آیتم‌ها
  expiresAt: string | null; // تاریخ انقضا سبد
  remainingSeconds: number; // تعداد ثانیه‌های باقیمانده (محاسبه شده)

  prices: {
    totalWithoutDiscount: number; // مجموع قیمت اصلی (بدون تخفیف)
    totalWithDiscount: number; // مجموع قیمت نهایی (با تخفیف)
    totalSavings: number; // مجموع صرفه‌جویی
    savingsPercentage: number; // درصد صرفه‌جویی کل
  };
}
```

---

## 🔢 منطق محاسبه در Backend

### برای هر CartItem:

```typescript
// 1. محاسبه قیمت اصلی (بدون تخفیف) برای quantity فعلی
const originalPrice = product.price * quantity;

// 2. محاسبه قیمت نهایی (با تخفیف) برای quantity فعلی
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
  price: finalPrice, // ✅ برای quantity فعلی محاسبه شده
  originalPrice: originalPrice, // ✅ برای quantity فعلی محاسبه شده
  discount: discount, // ✅ محاسبه شده
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
};
```

### برای کل سبد (CartResponse):

```typescript
// 1. محاسبه تعداد آیتم‌های مختلف
const itemCount = items.length;

// 2. محاسبه مجموع quantity
const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

// 3. محاسبه مجموع قیمت نهایی (با تخفیف)
const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

// 4. محاسبه مجموع قیمت اصلی (بدون تخفیف)
const totalWithoutDiscount = items.reduce(
  (sum, item) => sum + (item.originalPrice || item.price),
  0
);

// 5. محاسبه مجموع صرفه‌جویی
const totalSavings = totalWithoutDiscount - totalPrice;

// 6. محاسبه درصد صرفه‌جویی کل
const savingsPercentage =
  totalWithoutDiscount > 0
    ? Math.round((totalSavings / totalWithoutDiscount) * 100)
    : 0;

// 7. محاسبه تایمر (remainingSeconds)
const now = new Date();
const expiresAt = cart.expiresAt; // تاریخ انقضا از دیتابیس
const remainingSeconds = expiresAt
  ? Math.max(0, Math.floor((new Date(expiresAt) - now) / 1000))
  : 0;

// 8. ساخت CartResponse
const cartResponse = {
  cart: cart,
  items: items,
  itemCount: itemCount, // ✅ محاسبه شده
  totalItems: totalItems, // ✅ محاسبه شده
  totalPrice: totalPrice, // ✅ محاسبه شده
  expiresAt: expiresAt,
  remainingSeconds: remainingSeconds, // ✅ محاسبه شده
  prices: {
    totalWithoutDiscount: totalWithoutDiscount, // ✅ محاسبه شده
    totalWithDiscount: totalPrice, // ✅ محاسبه شده
    totalSavings: totalSavings, // ✅ محاسبه شده
    savingsPercentage: savingsPercentage, // ✅ محاسبه شده
  },
};
```

---

## 📊 مثال کامل Response

### مثال: سبد با 2 محصول (یکی با تخفیف، یکی بدون تخفیف)

```json
{
  "cart": {
    "_id": "cart_123456",
    "user": "user_789",
    "sessionId": null,
    "expiresAt": "2024-12-15T17:00:00.000Z",
    "createdAt": "2024-12-15T16:50:00.000Z",
    "updatedAt": "2024-12-15T16:55:00.000Z"
  },
  "items": [
    {
      "_id": "item_1",
      "product": {
        "_id": "product_123",
        "name": "دستبند طلا",
        "price": 6000000,
        "discountPrice": 5000000
      },
      "quantity": 2,
      "size": "16",
      "price": 10000000, // ✅ 5000000 * 2 (محاسبه شده در Backend)
      "originalPrice": 12000000, // ✅ 6000000 * 2 (محاسبه شده در Backend)
      "discount": 16, // ✅ محاسبه شده در Backend
      "createdAt": "2024-12-15T16:50:00.000Z",
      "updatedAt": "2024-12-15T16:55:00.000Z"
    },
    {
      "_id": "item_2",
      "product": {
        "_id": "product_456",
        "name": "گردنبند طلا",
        "price": 8000000,
        "discountPrice": null
      },
      "quantity": 1,
      "size": "18",
      "price": 8000000, // ✅ 8000000 * 1 (محاسبه شده در Backend)
      "originalPrice": 8000000, // ✅ 8000000 * 1 (محاسبه شده در Backend)
      "discount": 0, // ✅ محاسبه شده در Backend
      "createdAt": "2024-12-15T16:52:00.000Z",
      "updatedAt": "2024-12-15T16:52:00.000Z"
    }
  ],
  "itemCount": 2, // ✅ محاسبه شده در Backend
  "totalItems": 3, // ✅ 2 + 1 (محاسبه شده در Backend)
  "totalPrice": 18000000, // ✅ 10000000 + 8000000 (محاسبه شده در Backend)
  "expiresAt": "2024-12-15T17:00:00.000Z",
  "remainingSeconds": 300, // ✅ محاسبه شده در Backend (5 دقیقه باقیمانده)
  "prices": {
    "totalWithoutDiscount": 20000000, // ✅ 12000000 + 8000000 (محاسبه شده)
    "totalWithDiscount": 18000000, // ✅ 10000000 + 8000000 (محاسبه شده)
    "totalSavings": 2000000, // ✅ 20000000 - 18000000 (محاسبه شده)
    "savingsPercentage": 10 // ✅ (2000000 / 20000000) * 100 (محاسبه شده)
  }
}
```

---

## ⚠️ نکات مهم

### 1. محاسبه `price` و `originalPrice`

- ✅ **باید برای quantity فعلی محاسبه شود**
- ❌ **نباید برای 1 عدد باشد**

```typescript
// ✅ درست:
price: 10000000,        // برای quantity = 2
originalPrice: 12000000 // برای quantity = 2

// ❌ غلط:
price: 5000000,         // برای quantity = 1 (اشتباه!)
originalPrice: 6000000  // برای quantity = 1 (اشتباه!)
```

### 2. محاسبه `remainingSeconds`

- ✅ **باید در Backend محاسبه شود**
- ✅ **باید بر اساس `expiresAt` و زمان فعلی باشد**
- ❌ **Frontend نباید تایمر را محاسبه کند**

```typescript
// ✅ درست (Backend):
const now = new Date();
const expiresAt = cart.expiresAt;
const remainingSeconds = Math.max(
  0,
  Math.floor((new Date(expiresAt) - now) / 1000)
);

// ❌ غلط (Frontend):
// Frontend نباید این محاسبه را انجام دهد!
```

### 3. محاسبه `totalPrice`

- ✅ **باید مجموع `item.price` همه آیتم‌ها باشد**
- ✅ **باید در Backend محاسبه شود**

```typescript
// ✅ درست (Backend):
const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

// ❌ غلط (Frontend):
// Frontend نباید این محاسبه را انجام دهد!
```

### 4. محاسبه `totalItems`

- ✅ **باید مجموع `item.quantity` همه آیتم‌ها باشد**
- ✅ **باید در Backend محاسبه شود**

```typescript
// ✅ درست (Backend):
const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

// ❌ غلط (Frontend):
// Frontend نباید این محاسبه را انجام دهد!
```

---

## 🧪 تست

### تست 1: محاسبه قیمت برای quantity = 2

```bash
# افزودن محصول با quantity = 2
POST /site/cart
{
  "productId": "product_123",
  "quantity": 2
}

# بررسی Response
{
  "items": [{
    "quantity": 2,
    "price": 10000000,        // ✅ باید 5000000 * 2 باشد
    "originalPrice": 12000000 // ✅ باید 6000000 * 2 باشد
  }]
}
```

### تست 2: محاسبه تایمر

```bash
# دریافت سبد
GET /site/cart

# بررسی Response
{
  "expiresAt": "2024-12-15T17:00:00.000Z",
  "remainingSeconds": 300  // ✅ باید محاسبه شده باشد (5 دقیقه)
}
```

### تست 3: محاسبه مجموع

```bash
# دریافت سبد با چند آیتم
GET /site/cart

# بررسی Response
{
  "items": [
    { "price": 10000000, "quantity": 2 },
    { "price": 8000000, "quantity": 1 }
  ],
  "totalItems": 3,      // ✅ باید 2 + 1 باشد
  "totalPrice": 18000000 // ✅ باید 10000000 + 8000000 باشد
}
```

---

## 📝 چک‌لیست پیاده‌سازی

### برای هر CartItem:

- [ ] محاسبه `price` برای quantity فعلی
- [ ] محاسبه `originalPrice` برای quantity فعلی
- [ ] محاسبه `discount` (درصد تخفیف)

### برای CartResponse:

- [ ] محاسبه `itemCount` (تعداد آیتم‌های مختلف)
- [ ] محاسبه `totalItems` (مجموع quantity)
- [ ] محاسبه `totalPrice` (مجموع قیمت نهایی)
- [ ] محاسبه `remainingSeconds` (تایمر)
- [ ] محاسبه `prices.totalWithoutDiscount`
- [ ] محاسبه `prices.totalWithDiscount`
- [ ] محاسبه `prices.totalSavings`
- [ ] محاسبه `prices.savingsPercentage`

### تست:

- [ ] تست با quantity = 1
- [ ] تست با quantity = 2
- [ ] تست با quantity = 5
- [ ] تست با محصولات با تخفیف
- [ ] تست با محصولات بدون تخفیف
- [ ] تست تایمر (remainingSeconds)
- [ ] تست مجموع قیمت‌ها

---

## 🎯 خلاصه

### ✅ Backend باید:

1. **همه محاسبات را انجام دهد**
2. **مقادیر محاسبه شده را در response برگرداند**
3. **`price` و `originalPrice` را برای quantity فعلی محاسبه کند**
4. **`remainingSeconds` را محاسبه کند**
5. **`totalPrice` و `totalItems` را محاسبه کند**

### ❌ Frontend نباید:

1. **هیچ محاسبه‌ای انجام دهد**
2. **`price * quantity` محاسبه کند**
3. **`remainingSeconds` محاسبه کند**
4. **`totalPrice` محاسبه کند**
5. **هرگونه محاسبه ریاضی انجام دهد**

---

## 📞 پشتیبانی

اگر مشکلی داشتید:

1. ✅ بررسی کنید که همه فیلدها در response وجود دارند
2. ✅ بررسی کنید که محاسبات درست انجام می‌شود
3. ✅ بررسی کنید که `price` برای quantity فعلی است (نه برای 1 عدد)
4. ✅ Response را در Console/Network tab بررسی کنید

---

**موفق باشید! 🎉**
