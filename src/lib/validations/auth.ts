import { z } from "zod";
import { convertPersianToEnglish } from "@/lib/utils";
import { isPersianOnly } from "@/lib/utils";

/**
 * Schema validation برای فرم ثبت‌نام با پیام‌های خطای فارسی
 */
export const registerFormSchema = z.object({
  phoneNumber: z
    .string({ required_error: "شماره موبایل الزامی است" })
    .regex(
      /^09\d{9}$/,
      "فرمت شماره موبایل صحیح نیست. باید با ۰۹ شروع شود و ۱۱ رقم باشد"
    ),

  otpCode: z
    .string({ required_error: "کد تأیید الزامی است" })
    .regex(/^\d{6}$/, "کد تأیید باید دقیقاً ۶ رقم باشد"),

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

  nationalId: z
    .string({ required_error: "کد ملی الزامی است" })
    .transform((val) => convertPersianToEnglish(val)) // تبدیل فارسی به انگلیسی
    .refine(
      (val) => /^\d{10}$/.test(val),
      {
        message: "کد ملی باید دقیقاً ۱۰ رقم باشد",
      }
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
        const englishOnlyRegex = /^[a-zA-Z0-9._-]+$/;
        if (!englishOnlyRegex.test(val)) {
          return false;
        }
        // ✅ بررسی فرمت ایمیل
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(val);
      },
      {
        message: "ایمیل باید به انگلیسی وارد شود و فرمت صحیح داشته باشد",
      }
    )
    .optional()
    .or(z.literal("")),
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;
