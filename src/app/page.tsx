"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import HeroSlider from "@/components/features/HeroSlider";
import CategoryGrid from "@/components/features/CategoryGrid";
import BestSellingProducts from "@/components/features/BestSellingProducts";
import VideoSection from "@/components/features/VideoSection";
import BlogSection from "@/components/features/BlogSection";
import AboutUsSection from "@/components/features/AboutUsSection";
import GiftSection from "@/components/features/GiftSection";
import NewArrivalsSection from "@/components/features/NewArrivalsSection";
import FAQSection from "@/components/features/FAQSection";
import FeaturesBar from "@/components/features/FeaturesBar";
import ImageCards from "@/components/features/ImageCards";
import Divider from "@/components/ui/Divider";
import { getProducts } from "@/lib/api/products";
import { getBlogs } from "@/lib/api/blog";
import { getFAQs } from "@/lib/api/faq";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
  category: {
    slug: string;
  };
}

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  image: string;
  slug: string;
}

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  order: number;
}

export default function Home() {
  const pathname = usePathname();
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [giftProducts, setGiftProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ استفاده از useRef برای جلوگیری از double call در development mode
  // ✅ استفاده از sessionStorage برای حفظ lastPathname در navigation
  const hasFetchedRef = useRef(false);
  const fetchControllerRef = useRef<AbortController | null>(null);
  const fetchInProgressRef = useRef(false);

  useEffect(() => {
    // ✅ بررسی pathname قبلی از sessionStorage
    const storedLastPathname = typeof window !== 'undefined' ? sessionStorage.getItem('homePage_lastPathname') : null;
    
    // ✅ فقط اگر pathname "/" نیست، return کن
    if (pathname !== "/") {
      // ✅ Save current pathname to sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('homePage_lastPathname', pathname);
      }
      // ✅ Cancel any ongoing fetch
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
        fetchControllerRef.current = null;
      }
      fetchInProgressRef.current = false;
      return;
    }

    const isPathnameChanged = storedLastPathname !== null && storedLastPathname !== "/";
    
    // ✅ اگر pathname تغییر کرده است (از صفحه دیگری آمده‌ایم)، همیشه fetch کن
    if (isPathnameChanged) {
      // ✅ Reset refs و state ها برای fetch مجدد
      hasFetchedRef.current = false;
      fetchInProgressRef.current = false;
      setLoading(true);
      // ✅ Reset state ها برای نمایش loading
      setBestSellingProducts([]);
      setGiftProducts([]);
      setNewArrivals([]);
      setBlogPosts([]);
      setFaqs([]);
      // ✅ Update sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('homePage_lastPathname', pathname);
      }
    }

    // ✅ جلوگیری از double call: اگر در حال fetch هستیم یا قبلاً fetch کرده‌ایم و pathname تغییر نکرده، skip کن
    if (fetchInProgressRef.current || (hasFetchedRef.current && !isPathnameChanged)) {
      return;
    }
    
    hasFetchedRef.current = true;
    fetchInProgressRef.current = true;
    // ✅ Update sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('homePage_lastPathname', pathname);
    }

    // ✅ استفاده از AbortController برای مدیریت cleanup بهتر
    const controller = new AbortController();
    fetchControllerRef.current = controller;
    const isMounted = { current: true };

    const fetchData = async () => {
      try {
        // گرفتن محصولات پرفروش
        const bestSellingResponse = await getProducts({
          productType: "jewelry",
          isBestSelling: true,
          limit: 10,
        });
        if (isMounted.current && !controller.signal.aborted) setBestSellingProducts(bestSellingResponse.data);

        // گرفتن محصولات هدیه
        const giftsResponse = await getProducts({
          productType: "jewelry",
          isGift: true,
          limit: 12,
        });
        if (isMounted.current && !controller.signal.aborted) setGiftProducts(giftsResponse.data);

        // گرفتن محصولات جدید
        const newProductsResponse = await getProducts({
          productType: "jewelry",
          isNewArrival: true,
          limit: 12,
        });
        if (isMounted.current && !controller.signal.aborted) setNewArrivals(newProductsResponse.data);

        // گرفتن بلاگ ها
        const { posts } = await getBlogs({ isFeatured: true, limit: 2 });
        if (isMounted.current && !controller.signal.aborted) setBlogPosts(posts);

        // گرفتن سوالات متداول
        const faqData = await getFAQs();
        if (isMounted.current && !controller.signal.aborted) setFaqs(faqData);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Error fetching data:", error);
        }
      } finally {
        fetchInProgressRef.current = false;
        // ✅ همیشه loading را false کن - حتی اگر component unmount شده باشد
        // این برای جلوگیری از stuck شدن صفحه در حالت loading است
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted.current = false;
      fetchInProgressRef.current = false;
      // ✅ Abort ongoing fetch
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
        fetchControllerRef.current = null;
      }
    };
  }, [pathname]); // ✅ اضافه کردن pathname به dependency array

  // ✅ اطمینان از اینکه loading به false تنظیم می‌شود وقتی data ها دریافت شدند
  useEffect(() => {
    if (bestSellingProducts.length > 0 || giftProducts.length > 0 || newArrivals.length > 0) {
      setLoading(false);
    }
  }, [bestSellingProducts.length, giftProducts.length, newArrivals.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white w-full overflow-x-hidden">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Features Bar */}
      <FeaturesBar />

      {/* Image Cards */}
      <ImageCards />

      {/* Best Selling Products */}
      <BestSellingProducts products={bestSellingProducts} />

      {/* Divider */}
      <Divider />

      {/* Video Section */}
      <VideoSection />

      {/* Divider */}
      <Divider />

      {/* Gift Section */}
      <GiftSection products={giftProducts} />

      {/* New Arrivals Section */}
      <NewArrivalsSection products={newArrivals} />

      {/* About Us Section */}
      <AboutUsSection />

      {/* Features Bar */}
      <FeaturesBar />

      {/* Blog Section */}
      <BlogSection posts={blogPosts} />

      {/* FAQ Section */}
      <FAQSection faqs={faqs} />
    </div>
  );
}
