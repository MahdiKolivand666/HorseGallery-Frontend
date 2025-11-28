"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { getBlogs } from "@/lib/api/blog";

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: string;
  slug: string;
  publishedAt?: string;
  createdAt: string;
}

const BlogPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6; // 3 rows × 2 posts
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const { posts } = await getBlogs({ page: currentPage, limit: postsPerPage });
        
        if (isMounted) {
          const formattedPosts = posts.map((post: any) => ({
            _id: post._id,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content || "",
            image: post.image || "/images/blogs/Blog_Square.webp",
            date: new Date(post.publishedAt || post.createdAt).toLocaleDateString("fa-IR"),
            author: `${post.author?.firstName || ""} ${post.author?.lastName || ""}`.trim() || "نویسنده",
            category: post.category?.name || "عمومی",
            slug: post.slug,
            publishedAt: post.publishedAt,
            createdAt: post.createdAt,
          }));
          setBlogPosts(formattedPosts);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error fetching blogs:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBlogs();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen pt-[100px] pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!blogPosts || blogPosts.length === 0) {
    return (
      <div className="min-h-screen pt-[100px] pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <p className="text-gray-600">هیچ مقاله‌ای یافت نشد.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate pagination
  const currentPosts = blogPosts;
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
              key={post._id}
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
