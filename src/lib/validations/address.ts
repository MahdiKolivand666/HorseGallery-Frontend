import { z } from "zod";
import { persianToEnglish, isPersianOnly } from "@/lib/utils/persianNumber";

/**
 * Schema validation برای فرم آدرس با پیام‌های خطای فارسی
 * ✅ تمام اعداد (کد پستی، کد ملی، موبایل) باید به انگلیسی به backend ارسال شوند
 */
export const addressFormSchema = z.object({
  // ✅ عنوان آدرس: فقط فارسی، محدودیت کاراکتر (مثل "منزل، محل کار")
  title: z
    .string({ required_error: "عنوان آدرس الزامی است" })
    .min(3, "عنوان آدرس باید حداقل ۳ کاراکتر باشد")
    .max(25, "عنوان آدرس نمی‌تواند بیشتر از ۲۵ کاراکتر باشد")
    .refine(
      (val) => {
        // ✅ بررسی اینکه فقط حروف فارسی و فاصله و کاما دارد
        return /^[\u0600-\u06FF\s،]+$/.test(val);
      },
      {
        message: "عنوان آدرس باید فقط به فارسی وارد شود",
      }
    ),

  province: z
    .string({ required_error: "استان الزامی است" })
    .min(1, "لطفاً استان را انتخاب کنید"),

  city: z
    .string({ required_error: "شهر الزامی است" })
    .min(1, "شهر نمی‌تواند خالی باشد")
    .max(100, "نام شهر نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),

  // ✅ کد پستی: هم فارسی هم انگلیسی ورودی، تبدیل به انگلیسی برای ارسال
  postalCode: z
    .string({ required_error: "کد پستی الزامی است" })
    .transform((val) => persianToEnglish(val)) // ✅ تبدیل به انگلیسی
    .refine((val) => /^\d{10}$/.test(val), {
      message: "کد پستی باید دقیقاً ۱۰ رقم باشد",
    }),

  // ✅ آدرس: فقط فارسی، محدودیت کاراکتر و خط
  address: z
    .string({ required_error: "آدرس الزامی است" })
    .min(10, "آدرس باید حداقل ۱۰ کاراکتر باشد")
    .max(200, "آدرس نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد")
    .refine(
      (val) => {
        // ✅ بررسی اینکه فقط حروف فارسی، اعداد فارسی، فاصله و کاراکترهای مجاز دارد
        // ✅ شمارش خطوط (newline)
        const lines = val.split("\n").length;
        if (lines > 3) {
          return false;
        }
        // ✅ بررسی کاراکترهای مجاز
        return /^[\u0600-\u06FF\u06F0-\u06F9\s،.؛:]+$/.test(val);
      },
      {
        message: "آدرس باید فقط به فارسی وارد شود و حداکثر ۳ خط باشد",
      }
    ),

  // ✅ نام: فقط فارسی، محدودیت min/max
  firstName: z
    .string({ required_error: "نام الزامی است" })
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(30, "نام نمی‌تواند بیشتر از ۳۰ کاراکتر باشد")
    .refine(
      (val) => isPersianOnly(val),
      {
        message: "نام باید فقط شامل حروف فارسی باشد",
      }
    ),

  // ✅ نام خانوادگی: فقط فارسی، محدودیت min/max
  lastName: z
    .string({ required_error: "نام خانوادگی الزامی است" })
    .min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد")
    .max(30, "نام خانوادگی نمی‌تواند بیشتر از ۳۰ کاراکتر باشد")
    .refine(
      (val) => isPersianOnly(val),
      {
        message: "نام خانوادگی باید فقط شامل حروف فارسی باشد",
      }
    ),

  // ✅ کد ملی: هم فارسی هم انگلیسی ورودی، تبدیل به انگلیسی، 10 رقم
  nationalId: z
    .string({ required_error: "کد ملی الزامی است" })
    .transform((val) => persianToEnglish(val)) // ✅ تبدیل به انگلیسی
    .refine((val) => /^\d{10}$/.test(val), {
      message: "کد ملی باید دقیقاً ۱۰ رقم باشد",
    }),

  // ✅ موبایل: هم فارسی هم انگلیسی ورودی، تبدیل به انگلیسی، محدودیت تعداد رقم
  mobile: z
    .string({ required_error: "شماره موبایل الزامی است" })
    .transform((val) => persianToEnglish(val)) // ✅ تبدیل به انگلیسی
    .refine((val) => /^09\d{9}$/.test(val), {
      message: "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد",
    }),

  // ✅ ایمیل: فقط انگلیسی، محدودیت کاراکتر، template صحیح
  email: z
    .string()
    .max(100, "ایمیل نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد")
    .refine(
      (val) => {
        // ✅ اگر خالی است، قبول کن (optional field)
        if (!val || val.trim() === "") {
          return true;
        }
        // ✅ بررسی اینکه فقط کاراکترهای انگلیسی دارد
        const englishOnlyRegex =
          /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return englishOnlyRegex.test(val);
      },
      {
        message: "ایمیل باید به انگلیسی وارد شود و فرمت صحیح داشته باشد",
      }
    )
    .optional()
    .or(z.literal("")),

  // ✅ توضیحات: فقط فارسی، محدودیت کاراکتر
  notes: z
    .string()
    .max(200, "توضیحات نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد")
    .refine(
      (val) => {
        // ✅ اگر خالی است، قبول کن
        if (!val || val.trim() === "") {
          return true;
        }
        // ✅ بررسی اینکه فقط حروف فارسی، اعداد فارسی، فاصله و کاراکترهای مجاز دارد
        return /^[\u0600-\u06FF\u06F0-\u06F9\s،.؛:]+$/.test(val);
      },
      {
        message: "توضیحات باید فقط به فارسی وارد شود",
      }
    )
    .optional()
    .or(z.literal("")),

  isDefault: z.boolean().default(false),
});

export type AddressFormData = z.infer<typeof addressFormSchema>;
