/**
 * Blog API Functions
 */

import API_CONFIG from "@/config/api";

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  tags: string[];
  views: number;
  likes: number;
  isFeatured: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export async function getBlogs(params?: {
  page?: number;
  limit?: number;
  isFeatured?: boolean;
}): Promise<{ posts: BlogPost[]; total: number }> {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BLOGS}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const res = await fetch(url, {
      next: { revalidate: 300 }, // 5 minutes
    });

    if (!res.ok) {
      throw new Error("Failed to fetch blogs");
    }

    const data = await res.json();
    
    // اگه response شامل posts باشه
    if (data && typeof data === 'object' && 'posts' in data) {
      return {
        posts: Array.isArray(data.posts) ? data.posts : [],
        total: data.total || (Array.isArray(data.posts) ? data.posts.length : 0),
      };
    }
    
    // اگه مستقیم array باشه
    if (Array.isArray(data)) {
      return {
        posts: data,
        total: data.length,
      };
    }
    
    // در غیر این صورت، خالی برگردون
    return {
      posts: [],
      total: 0,
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { posts: [], total: 0 };
  }
}

/**
 * دریافت جزئیات یک بلاگ بر اساس slug
 */
export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BLOGS}/${slug}`;

    const res = await fetch(url, {
      next: { revalidate: 300 }, // 5 minutes
    });

    if (!res.ok) {
      throw new Error("Failed to fetch blog");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}
