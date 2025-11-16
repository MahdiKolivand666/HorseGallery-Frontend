"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: "درباره ما", href: "/about" },
      { label: "تماس با ما", href: "/contact" },
      { label: "فرصت‌های شغلی", href: "/careers" },
      { label: "داستان ما", href: "/story" },
    ],
    customer: [
      { label: "حساب کاربری", href: "/account" },
      { label: "سفارش‌های من", href: "/orders" },
      { label: "علاقه‌مندی‌ها", href: "/wishlist" },
      { label: "پیگیری سفارش", href: "/track" },
    ],
    help: [
      { label: "راهنمای خرید", href: "/guide" },
      { label: "پرسش‌های متداول", href: "/faq" },
      { label: "شیوه‌های پرداخت", href: "/payment" },
      { label: "ضمانت بازگشت", href: "/return" },
    ],
    legal: [
      { label: "قوانین و مقررات", href: "/terms" },
      { label: "حریم خصوصی", href: "/privacy" },
      { label: "شرایط استفاده", href: "/conditions" },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  ];

  return (
    <footer className="bg-primary text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 md:gap-10 lg:gap-12">
          {/* Logo */}
          <div className="flex justify-center items-center order-1 lg:order-5 mb-6 md:mb-0">
            <Link href="/" className="inline-block">
              <Image
                src="/images/Logo/Logo.png"
                alt="Horse Gallery"
                width={450}
                height={150}
                className="h-24 sm:h-32 lg:h-40 w-auto brightness-0 invert"
              />
            </Link>
          </div>

          {/* Contact Info & Social */}
          <div className="lg:col-span-2 lg:order-1 text-center md:text-right order-2">
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center md:justify-start gap-3 text-white/80 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 text-white/80 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@horsegallery.com</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 text-white/80 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>تهران، خیابان ولیعصر، پلاک ۱۲۳</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-white/80 text-sm leading-relaxed mb-6 text-center md:text-right">
              گالری اسب، فروشگاه آنلاین محصولات با کیفیت. ما با ارائه بهترین
              کالاها و خدمات، تلاش می‌کنیم تجربه خریدی لذت‌بخش و به‌یادماندنی
              برای شما فراهم کنیم.
            </p>

            {/* Social Links */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid - 3 columns on mobile/tablet */}
          <div className="lg:contents grid grid-cols-3 gap-3 sm:gap-6 order-3">
            {/* Company Links */}
            <div className="lg:order-2 text-center lg:text-right">
              <h3 className="text-white font-semibold text-sm lg:text-base mb-3 lg:mb-4">
                شرکت
              </h3>
              <ul className="space-y-2 lg:space-y-2.5">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white text-xs lg:text-sm transition-colors duration-200 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Links */}
            <div className="lg:order-3 text-center lg:text-right">
              <h3 className="text-white font-semibold text-sm lg:text-base mb-3 lg:mb-4">
                خدمات مشتریان
              </h3>
              <ul className="space-y-2 lg:space-y-2.5">
                {footerLinks.customer.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white text-xs lg:text-sm transition-colors duration-200 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help Links */}
            <div className="lg:order-4 text-center lg:text-right">
              <h3 className="text-white font-semibold text-sm lg:text-base mb-3 lg:mb-4">
                راهنما
              </h3>
              <ul className="space-y-2 lg:space-y-2.5">
                {footerLinks.help.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white text-xs lg:text-sm transition-colors duration-200 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-primary/50">
        <div className="max-w-7xl mx-auto py-3 px-4">
          <div className="flex justify-center items-center">
            {/* Copyright */}
            <p className="text-white/70 text-xs text-center">
              © {currentYear} گالری اسب. تمامی حقوق محفوظ است.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
