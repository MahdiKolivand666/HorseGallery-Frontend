/**
 * Helper functions for converting between Persian and English numbers
 */

/**
 * Convert Persian digits to English digits
 * @param text - Text containing Persian digits
 * @returns Text with English digits
 */
export function persianToEnglish(text: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  let result = text;
  for (let i = 0; i < persianDigits.length; i++) {
    result = result.replace(new RegExp(persianDigits[i], "g"), englishDigits[i]);
  }
  return result;
}

/**
 * Convert English digits to Persian digits
 * @param text - Text containing English digits
 * @returns Text with Persian digits
 */
export function englishToPersian(text: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  let result = text;
  for (let i = 0; i < englishDigits.length; i++) {
    result = result.replace(new RegExp(englishDigits[i], "g"), persianDigits[i]);
  }
  return result;
}

/**
 * Check if text contains only Persian characters (including spaces)
 * @param text - Text to check
 * @returns true if text contains only Persian characters
 */
export function isPersianOnly(text: string): boolean {
  // Persian Unicode range: \u0600-\u06FF
  // Also allow spaces
  const persianRegex = /^[\u0600-\u06FF\s]+$/;
  return persianRegex.test(text);
}

/**
 * Check if text contains only English characters (for email)
 * @param text - Text to check
 * @returns true if text contains only English characters
 */
export function isEnglishOnly(text: string): boolean {
  // English letters, numbers, and common email characters
  const englishRegex = /^[a-zA-Z0-9@._-]+$/;
  return englishRegex.test(text);
}

