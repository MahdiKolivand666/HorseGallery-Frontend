# 🐴 ساختار پروژه گالری اسب

## 📁 ساختار فولدرها

```
horse-gallery-frontend/
├── messages/              # فایل‌های ترجمه (next-intl)
│   └── fa.json           # ترجمه‌های فارسی
├── public/               # فایل‌های استاتیک (تصاویر، آیکون‌ها و...)
├── src/
│   ├── app/             # صفحات Next.js (App Router)
│   │   ├── layout.tsx   # Layout اصلی
│   │   ├── page.tsx     # صفحه اصلی
│   │   └── globals.css  # استایل‌های global
│   ├── components/
│   │   ├── layout/      # کامپوننت‌های layout (Navbar, Footer, Sidebar)
│   │   │   └── Navbar.tsx
│   │   ├── ui/          # کامپوننت‌های پایه و قابل استفاده مجدد
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── index.ts
│   │   └── features/    # کامپوننت‌های مختص به فیچرهای خاص
│   ├── hooks/           # Custom React Hooks
│   ├── lib/             # توابع کمکی و utility functions
│   ├── types/           # تایپ‌های TypeScript
│   ├── data/            # داده‌های استاتیک
│   ├── i18n.ts          # تنظیمات next-intl
│   └── middleware.ts    # Middleware برای next-intl
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 🌍 استفاده از next-intl

### 1. اضافه کردن ترجمه جدید

فایل `messages/fa.json` را ویرایش کنید:

```json
{
  "navbar": {
    "logo": "گالری اسب",
    "menu": {
      "home": "خانه",
      "products": "محصولات"
    }
  }
}
```

### 2. استفاده در کامپوننت‌ها

```tsx
"use client";

import { useTranslations } from "next-intl";

export default function MyComponent() {
  const t = useTranslations("navbar");

  return (
    <div>
      <h1>{t("logo")}</h1>
      <p>{t("menu.home")}</p>
    </div>
  );
}
```

### 3. استفاده در Server Components

```tsx
import { useTranslations } from "next-intl/server";

export default async function ServerComponent() {
  const t = await useTranslations("navbar");

  return <h1>{t("logo")}</h1>;
}
```

## 🎨 استفاده از UI Components

### Button

```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="lg" onClick={handleClick}>
  کلیک کنید
</Button>

<Button variant="outline" isLoading={loading}>
  در حال ارسال
</Button>
```

**Props:**
- `variant`: "primary" | "secondary" | "outline" | "ghost"
- `size`: "sm" | "md" | "lg"
- `isLoading`: boolean

### Card

```tsx
import { Card } from "@/components/ui";

<Card hoverable onClick={handleClick}>
  <h3>عنوان کارت</h3>
  <p>محتوای کارت</p>
</Card>
```

**Props:**
- `hoverable`: boolean - افکت hover (حرکت به بالا)
- `onClick`: function

### Input

```tsx
import { Input } from "@/components/ui";

<Input
  label="نام"
  placeholder="نام خود را وارد کنید"
  error={errors.name}
  helperText="نام باید حداقل 3 کاراکتر باشد"
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string

## 📝 استایل و Theme

### Tailwind CSS
از Tailwind CSS v4 استفاده می‌شود.

### فونت فارسی
فونت Vazirmatn به صورت خودکار بارگذاری می‌شود.

### راست‌چین (RTL)
تمام سایت به صورت راست‌چین تنظیم شده است:
- `dir="rtl"` در `<html>`
- `direction: rtl` در CSS

## 🎭 انیمیشن با Framer Motion

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  محتوا
</motion.div>
```

## 🔧 دستورات

```bash
# اجرای development server
npm run dev

# Build برای production
npm run build

# اجرای production server
npm run start

# Lint
npm run lint
```

## 📦 پکیج‌های اصلی

- **Next.js 16** - فریمورک React
- **next-intl** - مدیریت چندزبانه
- **Framer Motion** - انیمیشن
- **Tailwind CSS v4** - استایل‌دهی
- **Lucide React** - آیکون‌ها
- **TypeScript** - Type Safety

## 🎯 نکات مهم

1. **همه متن‌ها از next-intl**: هیچ متنی مستقیم در کامپوننت‌ها نباشد
2. **استفاده از UI Components**: از کامپوننت‌های پایه استفاده کنید
3. **راست‌چین بودن**: همیشه RTL را در نظر بگیرید
4. **TypeScript**: همه فایل‌ها با .tsx یا .ts
5. **Responsive**: موبایل فرست طراحی کنید

## 🚀 افزودن صفحه جدید

1. صفحه جدید در `src/app/` بسازید
2. ترجمه‌ها را در `messages/fa.json` اضافه کنید
3. از کامپوننت‌های UI استفاده کنید
4. از next-intl برای متن‌ها استفاده کنید

مثال:
```tsx
// src/app/products/page.tsx
"use client";

import { useTranslations } from "next-intl";
import { Button, Card } from "@/components/ui";

export default function ProductsPage() {
  const t = useTranslations("products");

  return (
    <div>
      <h1>{t("title")}</h1>
      {/* محتوای صفحه */}
    </div>
  );
}
```

