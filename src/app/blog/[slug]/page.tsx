"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Home, ChevronLeft, Calendar, User, Eye, Heart, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { getBlogBySlug, BlogPost } from "@/lib/api/blog";

const BlogDetailPage = () => {
  const params = useParams();
  const slug = params.slug as string;

  const [blogData, setBlogData] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const blog = await getBlogBySlug(slug);

        if (isMounted && blog) {
          setBlogData(blog);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBlog();

    return () => {
      isMounted = false;
    };
  }, [slug]);

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

  if (!blogData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            مقاله یافت نشد
          </h1>
          <Link
            href="/blog"
            className="text-primary hover:underline"
          >
            بازگشت به لیست مقالات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[110px] sm:pt-[105px] lg:pt-[105px]">
      {/* Hero Image with Title */}
      <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden">
        <Image
          src={blogData.image || "/images/blogs/Blog_Square.webp"}
          alt={blogData.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-8 lg:p-12">
          {/* Category Badge */}
          {blogData.category && (
            <Link
              href={`/blog/category/${blogData.category.slug}`}
              className="inline-block bg-primary text-white px-4 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors mb-3 rounded"
            >
              {blogData.category.name}
            </Link>
          )}
          {/* Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] tracking-wide leading-tight">
            {blogData.title}
          </h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>خانه</span>
            </Link>
            <ChevronLeft className="w-4 h-4 text-primary" />
            <Link href="/blog" className="text-primary hover:text-primary/80 transition-colors">
              بلاگ
            </Link>
            <ChevronLeft className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium line-clamp-1">
              {blogData.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Blog Content */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Meta Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200">
              {/* Author */}
              {blogData.author && (
                <div className="flex items-center gap-2">
                  {blogData.author.avatar ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={blogData.author.avatar}
                        alt={`${blogData.author.firstName} ${blogData.author.lastName}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span>
                    {blogData.author.firstName} {blogData.author.lastName}
                  </span>
                </div>
              )}

              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(blogData.publishedAt || blogData.createdAt).toLocaleDateString("fa-IR")}
                </span>
              </div>

              {/* Views */}
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{blogData.views.toLocaleString("fa-IR")} بازدید</span>
              </div>

              {/* Likes */}
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>{blogData.likes.toLocaleString("fa-IR")} لایک</span>
              </div>
            </div>
          </motion.div>

          {/* Blog Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-lg max-w-none mb-8"
          >
            <div
              className="text-gray-700 leading-relaxed text-justify"
              dangerouslySetInnerHTML={{ __html: blogData.content }}
            />
          </motion.div>

          {/* Tags */}
          {blogData.tags && blogData.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-3 pt-8 border-t border-gray-200"
            >
              <Tag className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">برچسب‌ها:</span>
              {blogData.tags.map((tag, index) => (
                <Link
                  key={index}
                  href={`/blog/tag/${tag}`}
                  className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 text-sm transition-colors rounded"
                >
                  {tag}
                </Link>
              ))}
            </motion.div>
          )}

          {/* Back to Blog */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 font-medium transition-colors rounded"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>بازگشت به لیست مقالات</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;

