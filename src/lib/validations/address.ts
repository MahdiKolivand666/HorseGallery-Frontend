import { z } from "zod";

/**
 * Schema validation برای فرم آدرس با پیام‌های خطای فارسی
 */
export const addressFormSchema = z.object({
  title: z
    .string({ required_error: "عنوان آدرس الزامی است" })
    .min(1, "عنوان آدرس نمی‌تواند خالی باشد")
    .max(100, "عنوان آدرس نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),

  province: z
    .string({ required_error: "استان الزامی است" })
    .min(1, "لطفاً استان را انتخاب کنید"),

  city: z
    .string({ required_error: "شهر الزامی است" })
    .min(1, "شهر نمی‌تواند خالی باشد")
    .max(100, "نام شهر نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),

  postalCode: z
    .string({ required_error: "کد پستی الزامی است" })
    .regex(/^\d{10}$/, "کد پستی باید دقیقاً ۱۰ رقم باشد"),

  address: z
    .string({ required_error: "آدرس الزامی است" })
    .min(10, "آدرس باید حداقل ۱۰ کاراکتر باشد")
    .max(500, "آدرس نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد"),

  firstName: z
    .string({ required_error: "نام الزامی است" })
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(50, "نام نمی‌تواند بیشتر از ۵۰ کاراکتر باشد")
    .regex(/^[\u0600-\u06FF\s]+$/, "نام باید فقط شامل حروف فارسی باشد"),

  lastName: z
    .string({ required_error: "نام خانوادگی الزامی است" })
    .min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد")
    .max(50, "نام خانوادگی نمی‌تواند بیشتر از ۵۰ کاراکتر باشد")
    .regex(
      /^[\u0600-\u06FF\s]+$/,
      "نام خانوادگی باید فقط شامل حروف فارسی باشد"
    ),

  nationalId: z
    .string({ required_error: "کد ملی الزامی است" })
    .regex(/^\d{10}$/, "کد ملی باید دقیقاً ۱۰ رقم باشد"),

  mobile: z
    .string({ required_error: "شماره موبایل الزامی است" })
    .regex(
      /^09\d{9}$/,
      "فرمت شماره موبایل صحیح نیست. باید با ۰۹ شروع شود و ۱۱ رقم باشد"
    ),

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

  notes: z
    .string()
    .max(500, "توضیحات نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد")
    .optional()
    .or(z.literal("")),

  isDefault: z.boolean().default(false),
});

export type AddressFormData = z.infer<typeof addressFormSchema>;
