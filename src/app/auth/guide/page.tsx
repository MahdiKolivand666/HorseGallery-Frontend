"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

const AuthGuidePage = () => {
  const [activeSection, setActiveSection] = useState("step1");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // offset for fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const navItems = [
    { id: "step1", title: "ثبت‌نام و ورود", number: "۱" },
    { id: "step2", title: "تکمیل اطلاعات", number: "۲" },
    { id: "step3", title: "انتخاب محصولات", number: "۳" },
    { id: "step4", title: "تکمیل و پرداخت سفارش", number: "۴" },
    { id: "notes", title: "نکات مهم", number: "★" },
  ];

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      navItems.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 sm:pt-28">
      {/* Content */}
      <div className="max-w-7xl mx-auto pr-4 sm:pr-6 lg:pr-8 py-8">
        <div className="flex gap-4">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-32 bg-white border border-gray-200">
              <div className="bg-primary/5 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-normal text-gray-900 text-right">
                  فهرست مطالب
                </h3>
              </div>
              <nav className="p-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-right px-3 py-2 transition-colors flex items-center gap-2 justify-end ${
                      activeSection === item.id
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="flex-1 text-xs">{item.title}</span>
                    <span
                      className={`w-6 h-6 flex items-center justify-center text-xs ${
                        activeSection === item.id
                          ? "bg-white text-primary"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.number}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200">
              {/* Title */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h1 className="text-xl sm:text-2xl font-normal text-gray-900 text-right mb-1">
                  راهنمای ثبت‌نام و خرید
                </h1>
                <p className="text-gray-600 text-right text-xs">
                  راهنمای گام به گام برای عضویت و خرید از گالری اسب
                </p>
              </div>

              {/* Steps */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* Step 1 */}
                <div
                  id="step1"
                  className="scroll-mt-32 border-r-2 border-primary"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary flex items-center justify-center text-white text-sm font-normal">
                        ۱
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <h2 className="text-base font-normal text-gray-900 mb-2">
                        ثبت‌نام و ورود
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-3 text-sm">
                        برای شروع خرید، ابتدا باید در سایت ثبت‌نام کنید. روی
                        دکمه &quot;ورود / ثبت‌نام&quot; کلیک کرده و شماره موبایل
                        خود را وارد نمایید.
                      </p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            شماره موبایل خود را با دقت وارد کنید
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            کد تأیید ارسال شده به موبایل خود را دریافت کنید
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            اطلاعات شخصی خود را تکمیل نمایید
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div
                  id="step2"
                  className="scroll-mt-32 border-r-2 border-primary"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary flex items-center justify-center text-white text-sm font-normal">
                        ۲
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <h2 className="text-base font-normal text-gray-900 mb-2">
                        تکمیل اطلاعات
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-3 text-sm">
                        برای احراز هویت و امنیت خرید، لطفاً اطلاعات زیر را با
                        دقت تکمیل نمایید:
                      </p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">نام و نام خانوادگی</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            کد ملی (برای احراز هویت و امنیت خرید)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            آدرس ایمیل معتبر (برای دریافت ۱۰,۰۰۰ تومان اعتبار)
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div
                  id="step3"
                  className="scroll-mt-32 border-r-2 border-primary"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary flex items-center justify-center text-white text-sm font-normal">
                        ۳
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <h2 className="text-base font-normal text-gray-900 mb-2">
                        انتخاب محصولات
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-3 text-sm">
                        پس از ثبت‌نام موفق، می‌توانید محصولات مورد نظر خود را
                        انتخاب کنید:
                      </p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            محصولات را از دسته‌بندی‌های مختلف مرور کنید
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            از فیلترها برای یافتن محصول مناسب استفاده کنید
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            محصولات مورد علاقه را به سبد خرید اضافه کنید
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div
                  id="step4"
                  className="scroll-mt-32 border-r-2 border-primary"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary flex items-center justify-center text-white text-sm font-normal">
                        ۴
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <h2 className="text-base font-normal text-gray-900 mb-2">
                        تکمیل و پرداخت سفارش
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-3 text-sm">
                        در آخرین مرحله، اطلاعات ارسال و پرداخت را تکمیل کنید:
                      </p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            آدرس دقیق ارسال را وارد کنید
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            روش پرداخت مناسب را انتخاب کنید
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            سفارش خود را نهایی و پرداخت کنید
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            کد رهگیری سفارش را دریافت کنید
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div
                id="notes"
                className="scroll-mt-32 bg-primary/5 p-4 border border-primary/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-primary flex items-center justify-center text-white text-sm">
                    ★
                  </div>
                  <h3 className="text-base font-normal text-gray-900 text-right">
                    نکات مهم
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-700 text-right">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      تمامی محصولات گالری اسب دارای گارانتی اصالت و ضمانت بازگشت
                      هستند
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      ارسال رایگان برای خریدهای بالای ۵ میلیون تومان
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      پشتیبانی ۲۴ ساعته برای پاسخگویی به سوالات شما
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthGuidePage;
