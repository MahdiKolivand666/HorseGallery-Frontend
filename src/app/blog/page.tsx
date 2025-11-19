"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: string;
  slug: string;
}

const BlogPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6; // 3 rows × 2 posts

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "تاریخچه طلا و جواهرات در ایران",
      excerpt:
        "طلا و جواهرات از دیرباز در فرهنگ و تمدن ایران جایگاه ویژه‌ای داشته‌اند. از دوران هخامنشیان تا به امروز، هنر جواهرسازی ایرانی همواره در جهان زبانزد بوده است. در این مقاله به بررسی تاریخچه غنی جواهرات ایرانی می‌پردازیم و نقش آن را در فرهنگ و هنر این سرزمین کهن بررسی می‌کنیم.",
      content: "محتوای کامل مقاله...",
      image: "/images/blogs/Blog_Square.webp",
      date: "۱۵ آذر ۱۴۰۳",
      author: "مریم احمدی",
      category: "تاریخچه",
      slug: "history-of-gold-jewelry",
    },
    {
      id: 2,
      title: "راهنمای انتخاب جواهرات مناسب",
      excerpt:
        "انتخاب جواهرات مناسب می‌تواند چالش‌برانگیز باشد. در این مقاله راهنمای کاملی برای انتخاب جواهرات مناسب با توجه به سلیقه، سبک زندگی و بودجه شما ارائه می‌دهیم. همچنین نکات مهم در نگهداری و مراقبت از جواهرات را بررسی می‌کنیم تا بتوانید از زیبایی آن‌ها برای سال‌های طولانی لذت ببرید.",
      content: "محتوای کامل مقاله...",
      image: "/images/blogs/Facetune_06-05-2024-10-01-19.webp",
      date: "۱۲ آذر ۱۴۰۳",
      author: "سارا کریمی",
      category: "راهنما",
      slug: "jewelry-selection-guide",
    },
    {
      id: 3,
      title: "هنر دست‌ساز بودن جواهرات",
      excerpt:
        "جواهرات دست‌ساز دارای ارزش و زیبایی منحصر به فردی هستند که در تولیدات انبوه یافت نمی‌شود. در این مقاله به بررسی فرآیند ساخت جواهرات دست‌ساز می‌پردازیم و اهمیت هنر و مهارت استادکاران را در خلق آثار هنری بی‌نظیر بررسی می‌کنیم. همچنین تفاوت‌های جواهرات دست‌ساز با تولیدات صنعتی را بررسی می‌کنیم.",
      content: "محتوای کامل مقاله...",
      image: "/images/blogs/nautilus.webp",
      date: "۱۰ آذر ۱۴۰۳",
      author: "علی محمدی",
      category: "هنر",
      slug: "handmade-jewelry-art",
    },
    {
      id: 4,
      title: "نحوه نگهداری و تمیز کردن طلا",
      excerpt:
        "طلا و جواهرات شما نیاز به مراقبت و نگهداری صحیح دارند تا درخشش و زیبایی خود را حفظ کنند. در این مقاله به شما آموزش می‌دهیم چگونه از جواهرات خود مراقبت کنید و با روش‌های صحیح تمیز کردن، عمر و درخشندگی آن‌ها را حفظ نمایید. همچنین نکات مهم نگهداری را بررسی می‌کنیم.",
      content: "محتوای کامل مقاله...",
      image: "/images/blogs/horoscopesArtboard_1_copy_19.webp",
      date: "۸ آذر ۱۴۰۳",
      author: "فاطمه رضایی",
      category: "مراقبت",
      slug: "gold-care-tips",
    },
    {
      id: 5,
      title: "ترندهای جواهرات در سال ۲۰۲۵",
      excerpt:
        "مد و ترندهای جواهرات همیشه در حال تغییر هستند. در این مقاله با جدیدترین ترندهای جواهرات در سال ۲۰۲۵ آشنا شوید و از آخرین مدهای روز مطلع باشید. از طراحی‌های مینیمال گرفته تا استفاده از سنگ‌های قیمتی رنگی، همه آنچه باید درباره مد امسال بدانید را بررسی می‌کنیم.",
      content: "محتوای کامل مقاله...",
      image:
        "/images/blogs/Blog_Square_faa559f7-3684-4f89-bd02-32198ab6d259.webp",
      date: "۵ آذر ۱۴۰۳",
      author: "نیلوفر حسینی",
      category: "مد و فشن",
      slug: "jewelry-trends-2025",
    },
    {
      id: 6,
      title: "راهنمای خرید هدیه جواهرات",
      excerpt:
        "خرید هدیه جواهرات می‌تواند کار دشواری باشد. این راهنما به شما کمک می‌کند تا بهترین هدیه جواهرات را برای عزیزانتان انتخاب کنید و لحظات خاصی را خلق کنید. از انتخاب مناسب برای مناسبت‌های مختلف گرفته تا نکات مهم در بودجه‌بندی، همه چیز را در این مقاله می‌آموزید.",
      content: "محتوای کامل مقاله...",
      image:
        "/images/blogs/horoscopesArtboard_1_copy_19_4b0ec817-d556-48f0-95df-5a0b892f9e8f.webp",
      date: "۳ آذر ۱۴۰۳",
      author: "رضا اکبری",
      category: "راهنما",
      slug: "gift-jewelry-guide",
    },
    {
      id: 7,
      title: "تفاوت طلای ۱۸ عیار با ۲۴ عیار",
      excerpt:
        "درک تفاوت بین عیارهای مختلف طلا برای خرید آگاهانه ضروری است. در این مقاله به بررسی کامل تفاوت‌های طلای ۱۸ عیار و ۲۴ عیار می‌پردازیم و ویژگی‌های هر کدام را بررسی می‌کنیم. همچنین نکات مهم در انتخاب عیار مناسب برای استفاده‌های مختلف را به شما آموزش می‌دهیم.",
      content: "محتوای کامل مقاله...",
      image: "/images/blogs/Blog_Square.webp",
      date: "۱ آذر ۱۴۰۳",
      author: "مهدی صادقی",
      category: "آموزشی",
      slug: "gold-karat-difference",
    },
    {
      id: 8,
      title: "جواهرات مناسب برای مراسم عروسی",
      excerpt:
        "انتخاب جواهرات مناسب برای مراسم عروسی یکی از مهم‌ترین تصمیمات عروس و داماد است. این راهنما به شما کمک می‌کند تا بهترین انتخاب را داشته باشید و در مهم‌ترین روز زندگی‌تان درخشان‌تر از همیشه باشید. از انتخاب ست کامل گرفته تا هماهنگی با لباس عروس، همه نکات را بررسی می‌کنیم.",
      content: "محتوای کامل مقاله...",
      image: "/images/blogs/Facetune_06-05-2024-10-01-19.webp",
      date: "۲۸ آبان ۱۴۰۳",
      author: "زهرا نوری",
      category: "مراسم",
      slug: "wedding-jewelry",
    },
    {
      id: 9,
      title: "سرمایه‌گذاری در طلا و جواهرات",
      excerpt:
        "طلا همیشه یکی از بهترین گزینه‌های سرمایه‌گذاری بوده است. در این مقاله به بررسی نکات مهم سرمایه‌گذاری در طلا و جواهرات می‌پردازیم و بهترین استراتژی‌ها برای سرمایه‌گذاری موفق را به شما آموزش می‌دهیم. همچنین ریسک‌ها و فرصت‌های این بازار را بررسی می‌کنیم.",
      content: "محتوای کامل مقاله...",
      image: "/images/blogs/nautilus.webp",
      date: "۲۵ آبان ۱۴۰۳",
      author: "امیر حسینی",
      category: "اقتصادی",
      slug: "gold-investment",
    },
    {
      id: 10,
      title: "آشنایی با انواع سنگ‌های قیمتی",
      excerpt:
        "سنگ‌های قیمتی زیبایی خاصی به جواهرات می‌بخشند. در این مقاله با انواع مختلف سنگ‌های قیمتی و ویژگی‌های آن‌ها آشنا می‌شوید و یاد می‌گیرید چگونه سنگ اصل را از تقلبی تشخیص دهید. همچنین درباره ارزش و کاربرد هر یک از سنگ‌های قیمتی اطلاعات کاملی به دست می‌آورید.",
      content: "محتوای کامل مقاله...",
      image: "/images/blogs/horoscopesArtboard_1_copy_19.webp",
      date: "۲۲ آبان ۱۴۰۳",
      author: "لیلا احمدی",
      category: "آموزشی",
      slug: "gemstones-types",
    },
  ];

  // Calculate pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-28">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>خانه</span>
            </Link>
            <ChevronLeft className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">بلاگ</span>
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8 text-right"
        >
          <h1 className="text-sm sm:text-base md:text-lg font-medium text-gray-700">
            مقاله
          </h1>
        </motion.div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {currentPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="flex flex-row-reverse gap-4">
                  {/* Image - Left Side (Vertical) */}
                  <div className="w-2/5 flex-shrink-0">
                    <div className="relative w-full h-full min-h-[280px] overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 640px) 40vw, 20vw"
                      />
                    </div>
                  </div>

                  {/* Content - Right Side */}
                  <div className="w-3/5 flex flex-col justify-between text-right py-2">
                    <div>
                      {/* Category & Date */}
                      <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                        <span className="bg-primary/10 text-primary px-2 py-1 text-[10px]">
                          {post.category}
                        </span>
                        <span className="text-[10px]">{post.date}</span>
                      </div>

                      {/* Title */}
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-6">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Read More Link */}
                    <div className="mt-3 flex items-center gap-2 text-primary text-xs font-medium group-hover:gap-3 transition-all justify-end">
                      <span>ادامه مطلب</span>
                      <ChevronLeft className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5; // تعداد صفحات نمایش داده شده

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= showPages; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - showPages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <nav className="flex items-center gap-1 sm:gap-2" dir="ltr">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg border transition-colors ${
          currentPage === 1
            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="صفحه قبل"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`min-w-[36px] h-9 px-3 rounded-lg border font-medium text-sm transition-colors ${
                currentPage === page
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page.toLocaleString('fa-IR')}
            </button>
          ) : (
            <span key={index} className="px-2 text-gray-400">
              ...
            </span>
          )
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg border transition-colors ${
          currentPage === totalPages
            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="صفحه بعد"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default BlogPage;
