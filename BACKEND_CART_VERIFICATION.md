# ✅ بررسی صحت پیاده‌سازی سبد خرید - Backend

**تاریخ:** دسامبر 2024  
**وضعیت:** 🔍 چک‌لیست بررسی

---

## 📋 خلاصه

این doc برای بررسی صحت پیاده‌سازی محاسبات سبد خرید در Backend است. همه محاسبات باید در Backend انجام شود و Frontend فقط داده‌ها را نمایش می‌دهد.

---

## 🔍 چک‌لیست بررسی

### 1️⃣ بررسی فیلدهای CartItem

برای هر `CartItem` در response، بررسی کنید:

- [ ] `price`: قیمت کل (با تخفیف) برای quantity فعلی
- [ ] `originalPrice`: قیمت کل اصلی (بدون تخفیف) برای quantity فعلی
- [ ] `unitPrice`: قیمت واحد (با تخفیف)
- [ ] `unitOriginalPrice`: قیمت واحد اصلی (بدون تخفیف)
- [ ] `discount`: درصد تخفیف (عدد)

**❌ اشتباه:**

```json
{
  "quantity": 2,
  "price": 5000000, // ❌ برای quantity = 1 است (اشتباه!)
  "originalPrice": 6000000 // ❌ برای quantity = 1 است (اشتباه!)
}
```

**✅ درست:**

```json
{
  "quantity": 2,
  "price": 10000000, // ✅ برای quantity = 2 (5000000 * 2)
  "originalPrice": 12000000, // ✅ برای quantity = 2 (6000000 * 2)
  "unitPrice": 5000000, // ✅ قیمت واحد
  "unitOriginalPrice": 6000000 // ✅ قیمت واحد اصلی
}
```

---

### 2️⃣ بررسی محاسبه قیمت برای quantity = 1

**تست:**

```bash
POST /site/cart
{
  "productId": "product_123",
  "quantity": 1
}
```

**بررسی Response:**

```json
{
  "items": [
    {
      "quantity": 1,
      "price": 5000000, // ✅ باید برابر با unitPrice باشد
      "originalPrice": 6000000, // ✅ باید برابر با unitOriginalPrice باشد
      "unitPrice": 5000000, // ✅ قیمت واحد
      "unitOriginalPrice": 6000000 // ✅ قیمت واحد اصلی
    }
  ]
}
```

**✅ درست:** `price === unitPrice` و `originalPrice === unitOriginalPrice`

---

### 3️⃣ بررسی محاسبه قیمت برای quantity = 2

**تست:**

```bash
POST /site/cart
{
  "productId": "product_123",
  "quantity": 2
}
```

**بررسی Response:**

```json
{
  "items": [
    {
      "quantity": 2,
      "price": 10000000, // ✅ باید unitPrice * 2 باشد
      "originalPrice": 12000000, // ✅ باید unitOriginalPrice * 2 باشد
      "unitPrice": 5000000, // ✅ قیمت واحد
      "unitOriginalPrice": 6000000 // ✅ قیمت واحد اصلی
    }
  ]
}
```

**✅ درست:**

- `price === unitPrice * quantity`
- `originalPrice === unitOriginalPrice * quantity`

---

### 4️⃣ بررسی محاسبه درصد تخفیف

**تست:**

```bash
POST /site/cart
{
  "productId": "product_with_discount",
  "quantity": 1
}
```

**بررسی Response:**

```json
{
  "items": [
    {
      "product": {
        "price": 6000000,
        "discountPrice": 5000000
      },
      "discount": 16 // ✅ باید ((6000000 - 5000000) / 6000000) * 100 = 16.67 ≈ 16
    }
  ]
}
```

**✅ درست:**

- اگر `discountPrice < price`: `discount = Math.round(((price - discountPrice) / price) * 100)`
- اگر `discountPrice === null` یا `discountPrice >= price`: `discount = 0`

---

### 5️⃣ بررسی محاسبه totalItems

**تست:**

```bash
GET /site/cart
```

**بررسی Response:**

```json
{
  "items": [{ "quantity": 2 }, { "quantity": 1 }, { "quantity": 3 }],
  "totalItems": 6 // ✅ باید 2 + 1 + 3 = 6 باشد
}
```

**✅ درست:** `totalItems === sum of all item.quantity`

---

### 6️⃣ بررسی محاسبه totalPrice

**تست:**

```bash
GET /site/cart
```

**بررسی Response:**

```json
{
  "items": [{ "price": 10000000 }, { "price": 8000000 }],
  "totalPrice": 18000000, // ✅ باید 10000000 + 8000000 = 18000000 باشد
  "prices": {
    "totalWithDiscount": 18000000 // ✅ باید برابر با totalPrice باشد
  }
}
```

**✅ درست:**

- `totalPrice === sum of all item.price`
- `totalPrice === prices.totalWithDiscount`

---

### 7️⃣ بررسی محاسبه prices

**تست:**

```bash
GET /site/cart
```

**بررسی Response:**

```json
{
  "items": [
    { "price": 10000000, "originalPrice": 12000000 },
    { "price": 8000000, "originalPrice": 8000000 }
  ],
  "prices": {
    "totalWithoutDiscount": 20000000, // ✅ باید 12000000 + 8000000 = 20000000 باشد
    "totalWithDiscount": 18000000, // ✅ باید 10000000 + 8000000 = 18000000 باشد
    "totalSavings": 2000000, // ✅ باید 20000000 - 18000000 = 2000000 باشد
    "savingsPercentage": 10 // ✅ باید (2000000 / 20000000) * 100 = 10 باشد
  }
}
```

**✅ درست:**

- `totalWithoutDiscount === sum of all item.originalPrice`
- `totalWithDiscount === sum of all item.price`
- `totalSavings === totalWithoutDiscount - totalWithDiscount`
- `savingsPercentage === Math.round((totalSavings / totalWithoutDiscount) * 100)`

---

### 8️⃣ بررسی محاسبه remainingSeconds

**تست:**

```bash
GET /site/cart
```

**بررسی Response:**

```json
{
  "cart": {
    "expiresAt": "2024-12-15T17:00:00.000Z"
  },
  "remainingSeconds": 300 // ✅ باید محاسبه شده باشد
}
```

**محاسبه:**

```typescript
const now = new Date();
const expiresAt = new Date(cart.expiresAt);
const remainingSeconds = Math.max(
  0,
  Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
);
```

**✅ درست:**

- `remainingSeconds` باید بر اساس `expiresAt` و زمان فعلی محاسبه شود
- اگر `expiresAt` گذشته باشد، `remainingSeconds = 0`

---

### 9️⃣ بررسی به‌روزرسانی quantity

**تست:**

```bash
PUT /site/cart/items/:itemId
{
  "quantity": 3
}
```

**بررسی Response:**

```json
{
  "items": [
    {
      "quantity": 3,
      "price": 15000000, // ✅ باید unitPrice * 3 باشد
      "originalPrice": 18000000 // ✅ باید unitOriginalPrice * 3 باشد
    }
  ]
}
```

**✅ درست:**

- وقتی `quantity` تغییر می‌کند، `price` و `originalPrice` باید دوباره محاسبه شوند
- `unitPrice` و `unitOriginalPrice` نباید تغییر کنند

---

### 🔟 بررسی محصول بدون تخفیف

**تست:**

```bash
POST /site/cart
{
  "productId": "product_without_discount",
  "quantity": 2
}
```

**بررسی Response:**

```json
{
  "items": [
    {
      "product": {
        "price": 6000000,
        "discountPrice": null
      },
      "quantity": 2,
      "price": 12000000, // ✅ باید 6000000 * 2 باشد
      "originalPrice": 12000000, // ✅ باید 6000000 * 2 باشد (برابر با price)
      "unitPrice": 6000000, // ✅ باید برابر با price محصول باشد
      "unitOriginalPrice": 6000000, // ✅ باید برابر با price محصول باشد
      "discount": 0 // ✅ باید 0 باشد
    }
  ]
}
```

**✅ درست:**

- اگر `discountPrice === null`: `unitPrice === product.price`
- `price === originalPrice`
- `discount === 0`

---

## 🧪 تست‌های جامع

### تست 1: سبد با چند محصول مختلف

```bash
# 1. افزودن محصول اول (با تخفیف)
POST /site/cart
{
  "productId": "product_1",
  "quantity": 2
}

# 2. افزودن محصول دوم (بدون تخفیف)
POST /site/cart
{
  "productId": "product_2",
  "quantity": 1
}

# 3. دریافت سبد
GET /site/cart
```

**بررسی Response:**

```json
{
  "items": [
    {
      "quantity": 2,
      "price": 10000000, // ✅ unitPrice * 2
      "originalPrice": 12000000, // ✅ unitOriginalPrice * 2
      "unitPrice": 5000000,
      "unitOriginalPrice": 6000000,
      "discount": 16
    },
    {
      "quantity": 1,
      "price": 8000000, // ✅ unitPrice * 1
      "originalPrice": 8000000, // ✅ unitOriginalPrice * 1
      "unitPrice": 8000000,
      "unitOriginalPrice": 8000000,
      "discount": 0
    }
  ],
  "itemCount": 2, // ✅ تعداد آیتم‌های مختلف
  "totalItems": 3, // ✅ 2 + 1
  "totalPrice": 18000000, // ✅ 10000000 + 8000000
  "prices": {
    "totalWithoutDiscount": 20000000, // ✅ 12000000 + 8000000
    "totalWithDiscount": 18000000, // ✅ 10000000 + 8000000
    "totalSavings": 2000000, // ✅ 20000000 - 18000000
    "savingsPercentage": 10 // ✅ (2000000 / 20000000) * 100
  },
  "remainingSeconds": 300 // ✅ محاسبه شده
}
```

---

### تست 2: تغییر quantity

```bash
# 1. افزودن محصول
POST /site/cart
{
  "productId": "product_1",
  "quantity": 1
}

# 2. تغییر quantity به 3
PUT /site/cart/items/:itemId
{
  "quantity": 3
}
```

**بررسی Response:**

```json
{
  "items": [
    {
      "quantity": 3, // ✅ به‌روز شده
      "price": 15000000, // ✅ unitPrice * 3 (به‌روز شده)
      "originalPrice": 18000000, // ✅ unitOriginalPrice * 3 (به‌روز شده)
      "unitPrice": 5000000, // ✅ بدون تغییر
      "unitOriginalPrice": 6000000 // ✅ بدون تغییر
    }
  ],
  "totalItems": 3, // ✅ به‌روز شده
  "totalPrice": 15000000 // ✅ به‌روز شده
}
```

---

### تست 3: تایمر (remainingSeconds)

```bash
# 1. افزودن محصول
POST /site/cart
{
  "productId": "product_1",
  "quantity": 1
}

# 2. دریافت سبد (بلافاصله)
GET /site/cart

# 3. صبر 5 ثانیه

# 4. دریافت سبد (دوباره)
GET /site/cart
```

**بررسی:**

- Response اول: `remainingSeconds` باید حدود 600 باشد (10 دقیقه)
- Response دوم: `remainingSeconds` باید حدود 595 باشد (5 ثانیه کمتر)

**✅ درست:** `remainingSeconds` باید هر بار محاسبه شود (نه cache شود)

---

## ⚠️ مشکلات رایج

### مشکل 1: `price` برای quantity = 1 محاسبه می‌شود

**❌ اشتباه:**

```json
{
  "quantity": 2,
  "price": 5000000 // ❌ برای quantity = 1 است
}
```

**✅ درست:**

```json
{
  "quantity": 2,
  "price": 10000000 // ✅ برای quantity = 2 است
}
```

---

### مشکل 2: `totalPrice` محاسبه نمی‌شود

**❌ اشتباه:**

```json
{
  "items": [{ "price": 10000000 }, { "price": 8000000 }],
  "totalPrice": 0 // ❌ محاسبه نشده
}
```

**✅ درست:**

```json
{
  "items": [{ "price": 10000000 }, { "price": 8000000 }],
  "totalPrice": 18000000 // ✅ محاسبه شده
}
```

---

### مشکل 3: `remainingSeconds` محاسبه نمی‌شود

**❌ اشتباه:**

```json
{
  "cart": {
    "expiresAt": "2024-12-15T17:00:00.000Z"
  },
  "remainingSeconds": null // ❌ محاسبه نشده
}
```

**✅ درست:**

```json
{
  "cart": {
    "expiresAt": "2024-12-15T17:00:00.000Z"
  },
  "remainingSeconds": 300 // ✅ محاسبه شده
}
```

---

### مشکل 4: `unitPrice` و `unitOriginalPrice` وجود ندارند

**❌ اشتباه:**

```json
{
  "items": [
    {
      "price": 10000000,
      "originalPrice": 12000000
      // ❌ unitPrice و unitOriginalPrice وجود ندارند
    }
  ]
}
```

**✅ درست:**

```json
{
  "items": [
    {
      "price": 10000000,
      "originalPrice": 12000000,
      "unitPrice": 5000000, // ✅ وجود دارد
      "unitOriginalPrice": 6000000 // ✅ وجود دارد
    }
  ]
}
```

---

## 📝 چک‌لیست نهایی

### برای هر CartItem:

- [ ] `price` برای quantity فعلی محاسبه شده است
- [ ] `originalPrice` برای quantity فعلی محاسبه شده است
- [ ] `unitPrice` وجود دارد
- [ ] `unitOriginalPrice` وجود دارد
- [ ] `discount` محاسبه شده است
- [ ] `price === unitPrice * quantity`
- [ ] `originalPrice === unitOriginalPrice * quantity`

### برای CartResponse:

- [ ] `itemCount` محاسبه شده است
- [ ] `totalItems` محاسبه شده است (مجموع quantity)
- [ ] `totalPrice` محاسبه شده است (مجموع price)
- [ ] `remainingSeconds` محاسبه شده است
- [ ] `prices.totalWithoutDiscount` محاسبه شده است
- [ ] `prices.totalWithDiscount` محاسبه شده است
- [ ] `prices.totalSavings` محاسبه شده است
- [ ] `prices.savingsPercentage` محاسبه شده است
- [ ] `totalPrice === prices.totalWithDiscount`

### تست‌ها:

- [ ] تست با quantity = 1
- [ ] تست با quantity = 2
- [ ] تست با quantity = 5
- [ ] تست با محصولات با تخفیف
- [ ] تست با محصولات بدون تخفیف
- [ ] تست تغییر quantity
- [ ] تست تایمر (remainingSeconds)
- [ ] تست مجموع قیمت‌ها

---

## 🎯 خلاصه

### ✅ باید بررسی کنید:

1. **`price` و `originalPrice` برای quantity فعلی هستند** (نه برای 1 عدد)
2. **`unitPrice` و `unitOriginalPrice` وجود دارند**
3. **`discount` محاسبه شده است**
4. **`totalPrice` و `totalItems` محاسبه شده‌اند**
5. **`remainingSeconds` محاسبه شده است**
6. **`prices` همه فیلدها محاسبه شده‌اند**

### ❌ نباید:

1. **`price` برای quantity = 1 باشد** (وقتی quantity = 2 است)
2. **`totalPrice` محاسبه نشده باشد**
3. **`remainingSeconds` null باشد**
4. **`unitPrice` و `unitOriginalPrice` وجود نداشته باشند**

---

## 📞 پشتیبانی

اگر مشکلی داشتید:

1. ✅ Response را در Console/Network tab بررسی کنید
2. ✅ مقادیر را با فرمول‌های بالا مقایسه کنید
3. ✅ تست‌های بالا را اجرا کنید
4. ✅ با Frontend تیم هماهنگ کنید

---

**موفق باشید! 🎉**
