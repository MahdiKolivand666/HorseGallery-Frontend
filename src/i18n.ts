import { getRequestConfig } from "next-intl/server";

// Can be imported from a shared config
export const locales = ["fa"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Default to 'fa' if locale is not valid
  const validLocale = locales.includes(locale as Locale) ? locale : "fa";

  return {
    locale: validLocale as string,
    messages: (await import(`../messages/${validLocale}.json`)).default,
    timeZone: "Asia/Tehran",
    now: new Date(),
  };
});
