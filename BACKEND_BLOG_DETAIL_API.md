# 📝 راهنمای Backend: API جزئیات بلاگ (Blog Detail)

این document شامل تمام تغییرات و راهنمای پیاده‌سازی API جزئیات بلاگ برای Backend است.

---

## 🎯 خلاصه

برای نمایش صفحه جزئیات بلاگ، به یک endpoint جدید نیاز داریم که:

- جزئیات کامل یک مقاله را بر اساس **slug** برگرداند
- تعداد بازدید را به صورت خودکار افزایش دهد
- تمام اطلاعات مورد نیاز frontend را فراهم کند

---

## 📡 API Endpoint

### دریافت جزئیات بلاگ

```
GET /blog/public/:slug
```

**مثال:**

```
GET http://localhost:4001/blog/public/gold-care-tips
```

---

## 📥 Response Format

### Success Response (200 OK)

```json
{
  "_id": "676c5eecffbcf636db303389",
  "title": "راهنمای نگهداری از طلا",
  "slug": "gold-care-tips",
  "content": "<p>محتوای کامل مقاله با HTML...</p><p>پاراگراف دوم...</p>",
  "excerpt": "خلاصه مقاله برای نمایش در لیست...",
  "image": "/images/blogs/gold-care.webp",
  "category": {
    "_id": "676c5eecffbcf636db30338a",
    "name": "آموزش و راهنما",
    "slug": "guides"
  },
  "author": {
    "_id": "676c5eecffbcf636db30338b",
    "firstName": "محمد",
    "lastName": "احمدی"
  },
  "tags": ["نگهداری", "طلا", "آموزش"],
  "views": 1250,
  "likes": 89,
  "isFeatured": true,
  "publishedAt": "2024-11-15T10:30:00.000Z",
  "createdAt": "2024-11-10T08:00:00.000Z",
  "updatedAt": "2024-11-15T10:30:00.000Z"
}
```

### Error Response (404 Not Found)

```json
{
  "success": false,
  "message": "مقاله یافت نشد"
}
```

---

## 🗄️ Schema

### Blog Model

```javascript
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // ✅ برای جستجوی سریع
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxLength: 500,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true, // ✅ برای فیلتر بر اساس تگ
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index برای جستجوی بهتر
blogSchema.index({ slug: 1 });
blogSchema.index({ category: 1, isPublished: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ publishedAt: -1 });

const Blog = mongoose.model("Blog", blogSchema);
```

---

## 💻 Controller Code

### 1. دریافت جزئیات بلاگ

```javascript
// controllers/blogController.js

/**
 * @route   GET /blog/public/:slug
 * @desc    دریافت جزئیات یک بلاگ بر اساس slug
 * @access  Public
 */
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // یافتن بلاگ بر اساس slug
    const blog = await Blog.findOne({
      slug,
      isPublished: true, // ✅ فقط بلاگ‌های منتشر شده
    })
      .populate("category", "name slug")
      .populate("author", "firstName lastName")
      .lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "مقاله یافت نشد",
      });
    }

    // ✅ افزایش تعداد بازدید (به صورت async و بدون انتظار)
    Blog.findByIdAndUpdate(
      blog._id,
      { $inc: { views: 1 } },
      { new: false }
    ).exec();

    return res.status(200).json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).json({
      success: false,
      message: "خطا در دریافت مقاله",
      error: error.message,
    });
  }
};

module.exports = {
  getBlogBySlug,
};
```

---

## 🛤️ Routes

```javascript
// routes/blogRoutes.js

const express = require("express");
const router = express.Router();
const { getBlogBySlug, getBlogs } = require("../controllers/blogController");

// Public routes
router.get("/public", getBlogs); // لیست بلاگ‌ها
router.get("/public/:slug", getBlogBySlug); // جزئیات بلاگ ✅

module.exports = router;
```

---

## 🔧 نکات پیاده‌سازی

### 1. **Slug Generation**

هنگام ایجاد بلاگ، slug باید به صورت خودکار از title ساخته شود:

```javascript
// utils/slugify.js
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // فاصله‌ها به خط تیره
    .replace(/[^\w\u0600-\u06FF-]+/g, "") // حذف کاراکترهای غیرمجاز (حفظ فارسی)
    .replace(/--+/g, "-"); // چند خط تیره پشت سر هم به یک خط تیره
};

// استفاده در controller
blogSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("title")) {
    this.slug = slugify(this.title);
  }
  next();
});
```

### 2. **Increment Views**

برای افزایش performance، افزایش views به صورت async و بدون انتظار انجام می‌شود:

```javascript
// ❌ کند (منتظر می‌ماند)
await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

// ✅ سریع (async)
Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec();
```

### 3. **Populate Fields**

برای کاهش حجم response، فقط فیلدهای مورد نیاز را populate کنید:

```javascript
.populate("category", "name slug") // ✅ فقط name و slug
.populate("author", "firstName lastName") // ✅ فقط نام
```

### 4. **Content Format**

محتوای بلاگ (`content`) باید:

- به صورت **HTML** ذخیره شود (برای نمایش بهتر)
- از **HTML Sanitization** استفاده کنید (برای امنیت)

```javascript
// استفاده از sanitize-html
const sanitizeHtml = require("sanitize-html");

const cleanContent = sanitizeHtml(content, {
  allowedTags: [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "em",
    "u",
    "a",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "img",
  ],
  allowedAttributes: {
    a: ["href", "target"],
    img: ["src", "alt", "title"],
  },
});
```

---

## 🧪 تست API

### با curl:

```bash
# دریافت جزئیات بلاگ
curl http://localhost:4001/blog/public/gold-care-tips
```

### با Postman:

1. **Method:** GET
2. **URL:** `http://localhost:4001/blog/public/gold-care-tips`
3. **Headers:** (هیچ header خاصی نیاز نیست)

---

## 📊 Performance Tips

### 1. **Indexing**

```javascript
// اضافه کردن index‌ها
blogSchema.index({ slug: 1 }); // ✅ جستجوی سریع بر اساس slug
blogSchema.index({ category: 1, isPublished: 1 }); // ✅ فیلتر بر اساس category
blogSchema.index({ tags: 1 }); // ✅ جستجوی بر اساس تگ
```

### 2. **Caching**

برای بلاگ‌هایی که زیاد تغییر نمی‌کنند، از Redis cache استفاده کنید:

```javascript
const redis = require("redis");
const client = redis.createClient();

const getCachedBlog = async (slug) => {
  const cached = await client.get(`blog:${slug}`);
  if (cached) {
    return JSON.parse(cached);
  }

  const blog = await Blog.findOne({ slug }).populate(...);
  await client.setEx(`blog:${slug}`, 3600, JSON.stringify(blog)); // 1 hour cache
  return blog;
};
```

### 3. **Lean Queries**

از `.lean()` برای افزایش سرعت استفاده کنید:

```javascript
const blog = await Blog.findOne({ slug })
  .populate("category", "name slug")
  .lean(); // ✅ سریعتر (plain JavaScript object)
```

---

## ✅ Checklist برای Backend

- [ ] ایجاد Blog Schema با فیلدهای مورد نیاز
- [ ] اضافه کردن index برای slug
- [ ] پیاده‌سازی `getBlogBySlug` controller
- [ ] افزودن route جدید: `GET /blog/public/:slug`
- [ ] پیاده‌سازی افزایش خودکار views
- [ ] Populate کردن category و author
- [ ] بررسی `isPublished === true`
- [ ] HTML Sanitization برای content
- [ ] تست API با curl/Postman
- [ ] اضافه کردن error handling مناسب

---

## 📝 مثال کامل داده نمونه

```javascript
// نمونه داده برای insert در MongoDB
{
  "title": "راهنمای کامل نگهداری از جواهرات طلا",
  "slug": "gold-jewelry-care-guide",
  "content": "<p>طلا یکی از گرانبهاترین فلزات است که نیاز به مراقبت ویژه دارد.</p><h2>نکات مهم</h2><ul><li>از مواد شیمیایی دور نگه دارید</li><li>در جای خشک نگهداری کنید</li></ul>",
  "excerpt": "راهنمای کامل نگهداری از طلا و جواهرات با نکات کاربردی",
  "image": "/images/blogs/gold-care.webp",
  "category": "676c5eecffbcf636db30338a",
  "author": "676c5eecffbcf636db30338b",
  "tags": ["طلا", "نگهداری", "آموزش", "جواهرات"],
  "views": 0,
  "likes": 0,
  "isFeatured": true,
  "isPublished": true,
  "publishedAt": new Date(),
}
```

---

## 🔗 لینک‌های مرتبط

- [Frontend Blog Detail Page](./src/app/blog/[slug]/page.tsx)
- [Blog API Functions](./src/lib/api/blog.ts)

---

## 📞 پشتیبانی

اگر سوال یا مشکلی دارید:

1. ✅ بررسی کنید slug درست است
2. ✅ بررسی کنید `isPublished === true`
3. ✅ بررسی کنید populate‌ها درست کار می‌کنند
4. ✅ log کردن errors در console

**تاریخ به‌روزرسانی:** 2025-11-30  
**نسخه API:** 1.0

---

**موفق باشید! 🚀**
