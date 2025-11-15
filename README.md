# 🐴 گالری اسب - Horse Gallery Frontend

یک فروشگاه آنلاین مدرن و زیبا با Next.js 16، طراحی شده با استانداردهای بالا و معماری حرفه‌ای.

## ✨ ویژگی‌ها

- ⚡️ **Next.js 16** با App Router
- 🌍 **چندزبانه** با next-intl (فعلاً فارسی)
- 🎨 **Tailwind CSS v4** برای استایل‌دهی
- 🎭 **Framer Motion** برای انیمیشن‌های smooth
- 📱 **Responsive** و موبایل‌فرست
- 🔍 **TypeScript** برای type safety
- 🎯 **Component-based** با ساختار استاندارد
- ✅ **RTL Support** کامل فارسی

## 🚀 شروع سریع

### نصب

```bash
npm install
```

### اجرا

```bash
# Development
npm run dev

# پورت پیش‌فرض: 4000
# آدرس: http://localhost:4000
```

### Build

```bash
npm run build
npm run start
```

## 📁 ساختار پروژه

```
src/
├── app/                    # صفحات Next.js
├── components/
│   ├── layout/            # Navbar, Footer, Sidebar
│   ├── ui/                # Button, Card, Input (قابل استفاده مجدد)
│   └── features/          # کامپوننت‌های مختص فیچرها
├── hooks/                 # Custom React Hooks
├── lib/                   # Helper functions
├── types/                 # TypeScript types
├── i18n.ts               # تنظیمات next-intl
└── middleware.ts         # Middleware

messages/                  # ترجمه‌ها
└── fa.json               # فارسی
```

برای اطلاعات بیشتر [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) را ببینید.

## 🎨 UI Components

### Button

```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="lg">
  کلیک کنید
</Button>
```

### Card

```tsx
import { Card } from "@/components/ui";

<Card hoverable>
  محتوای کارت
</Card>
```

### Input

```tsx
import { Input } from "@/components/ui";

<Input
  label="نام"
  placeholder="نام خود را وارد کنید"
/>
```

## 🌍 چندزبانه با next-intl

### استفاده در کامپوننت

```tsx
"use client";

import { useTranslations } from "next-intl";

export default function MyComponent() {
  const t = useTranslations("navbar");

  return <h1>{t("logo")}</h1>;
}
```

### اضافه کردن ترجمه

فایل `messages/fa.json`:

```json
{
  "navbar": {
    "logo": "گالری اسب"
  }
}
```

## 🛠️ تکنولوژی‌ها

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **i18n**: next-intl
- **Icons**: Lucide React
- **Font**: Vazirmatn (فارسی)

## 📝 اسکریپت‌ها

```bash
npm run dev        # اجرای development server (پورت 4000)
npm run build      # ساخت برای production
npm run start      # اجرای production server
npm run lint       # بررسی کد با ESLint
```

## 🎯 ویژگی‌های Navbar

- ✅ Scroll effect (تغییر رنگ با scroll)
- ✅ انیمیشن smooth با Framer Motion
- ✅ جستجوی dropdown
- ✅ راست‌چین (RTL)
- ✅ Responsive
- ✅ تمام متن‌ها از next-intl

## 📦 Backend Integration

این فرانت‌اند برای اتصال به بکند NestJS طراحی شده است.

## 🤝 مشارکت

1. Fork کنید
2. Branch جدید بسازید (`git checkout -b feature/amazing-feature`)
3. Commit کنید (`git commit -m 'Add amazing feature'`)
4. Push کنید (`git push origin feature/amazing-feature`)
5. Pull Request باز کنید

## 📄 لایسنس

This project is licensed under the MIT License.

## 👨‍💻 توسعه‌دهنده

ساخته شده با ❤️ برای گالری اسب

---

برای سوالات و پشتیبانی، Issue باز کنید.
