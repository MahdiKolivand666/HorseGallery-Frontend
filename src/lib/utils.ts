import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * تبدیل اعداد فارسی به انگلیسی
 */
export function convertPersianToEnglish(str: string): string {
  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  let result = str;

  // تبدیل اعداد فارسی
  for (let i = 0; i < persianNumbers.length; i++) {
    result = result.replace(
      new RegExp(persianNumbers[i], "g"),
      englishNumbers[i]
    );
  }

  // تبدیل اعداد عربی
  for (let i = 0; i < arabicNumbers.length; i++) {
    result = result.replace(
      new RegExp(arabicNumbers[i], "g"),
      englishNumbers[i]
    );
  }

  return result;
}

/**
 * تبدیل اعداد انگلیسی به فارسی
 */
export function convertEnglishToPersian(str: string): string {
  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  let result = str;
  for (let i = 0; i < englishNumbers.length; i++) {
    result = result.replace(
      new RegExp(englishNumbers[i], "g"),
      persianNumbers[i]
    );
  }
  return result;
}

/**
 * فقط اعداد را استخراج می‌کند (فارسی و انگلیسی)
 */
export function extractNumbers(str: string): string {
  return str.replace(/[^\d۰-۹]/g, "");
}

/**
 * بررسی اینکه آیا رشته فقط حروف فارسی است
 */
export function isPersianOnly(str: string): boolean {
  // ✅ فقط حروف فارسی، فاصله و کاراکترهای خاص فارسی (مثل اعراب)
  return /^[\u0600-\u06FF\s\u200C\u200D]+$/.test(str);
}
