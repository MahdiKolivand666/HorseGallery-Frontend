"use client";

import { useEffect, useState } from "react";
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
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [giftProducts, setGiftProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // گرفتن محصولات پرفروش
        const bestSellingResponse = await getProducts({
          productType: "jewelry",
          isBestSelling: true,
          limit: 10,
        });
        if (isMounted) setBestSellingProducts(bestSellingResponse.data);

        // گرفتن محصولات هدیه
        const giftsResponse = await getProducts({
          productType: "jewelry",
          isGift: true,
          limit: 12,
        });
        if (isMounted) setGiftProducts(giftsResponse.data);

        // گرفتن محصولات جدید
        const newProductsResponse = await getProducts({
          productType: "jewelry",
          isNewArrival: true,
          limit: 12,
        });
        if (isMounted) setNewArrivals(newProductsResponse.data);

        // گرفتن بلاگ ها
        const { posts } = await getBlogs({ isFeatured: true, limit: 2 });
        if (isMounted) setBlogPosts(posts);

        // گرفتن سوالات متداول
        const faqData = await getFAQs();
        if (isMounted) setFaqs(faqData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

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
