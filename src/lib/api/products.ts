/**
 * Product API Functions
 */

import API_CONFIG from "@/config/api";

export interface Product {
  _id: string;
  name: string;
  slug: string;
  code: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    _id: string;
    name: string;
    slug: string;
  };
  specifications: {
    weight?: string;
    karat?: string;
    material?: string;
    dimensions?: string;
    brand?: string;
    coverage?: string;
    warranty?: string;
  };
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSelling: boolean;
  isNewArrival: boolean;
  isGift: boolean;
  rating?: number;
  reviewsCount?: number;

  // فیلدهای جدید برای صفحه پیشنهادات ویژه ✅
  onSale?: boolean; // آیا محصول در حال حاضر تخفیف دارد؟
  discount?: number; // درصد تخفیف (0-100)
  lowCommission?: boolean; // آیا محصول اجرت کم دارد؟
  commission?: number; // درصد اجرت
  wage?: string; // اجرت (کم، متوسط، زیاد)
  salesCount?: number; // تعداد فروش
  viewsCount?: number; // تعداد بازدید
  popularityScore?: number; // امتیاز محبوبیت (محاسبه شده)

  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  isFeatured?: boolean;
  isBestSelling?: boolean;
  isNewArrival?: boolean;
  isGift?: boolean;
  page?: number;
  limit?: number;
  // Price filters
  minPrice?: number;
  maxPrice?: number;
  // Color filter
  colors?: string[];
  // Karat filter
  karats?: string[];
  // Brand filter
  brands?: string[];
  // Branch filter
  branches?: string[];
  // Wage filter
  wages?: string[];
  // Size filter
  sizes?: string[];
  // Coating filter
  coatings?: string[];
  // Weight filter
  minWeight?: number;
  maxWeight?: number;
  // Stock and sale filters
  inStock?: boolean;
  onSale?: boolean;
  lowCommission?: boolean;
  // Sort
  sortBy?: string;
}

export async function getProducts(params?: ProductFilters): Promise<Product[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle arrays (colors, karats, brands, etc.)
          if (Array.isArray(value)) {
            if (value.length > 0) {
              // Send as comma-separated string or multiple params
              // Backend should handle: colors=red,gold or colors[]=red&colors[]=gold
              value.forEach((item) => queryParams.append(key, String(item)));
            }
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    // Check if we're in client or server context
    const fetchOptions: RequestInit =
      typeof window === "undefined"
        ? { next: { revalidate: 60 } } // Server-side: ISR with 1 minute revalidation
        : { cache: "no-store" }; // Client-side: no caching

    const res = await fetch(url, fetchOptions);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `Failed to fetch products: ${res.status}`,
        errorText.substring(0, 200)
      );
      throw new Error(`Failed to fetch products: ${res.status}`);
    }

    // Check content type
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Response is not JSON:", text.substring(0, 200));
      return [];
    }

    const data = await res.json();

    // اگه response یک object با data property باشه، اون رو extract کن
    if (data && typeof data === "object" && "data" in data) {
      return data.data || [];
    }

    // اگه مستقیم array باشه، برگردون
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    // Check if we're in client or server context
    const fetchOptions: RequestInit =
      typeof window === "undefined"
        ? { next: { revalidate: 60 } } // Server-side
        : { cache: "no-store" }; // Client-side

    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${slug}`,
      fetchOptions
    );

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
    return null;
  }
}

export async function getProductCategories() {
  try {
    // Check if we're in client or server context
    const fetchOptions: RequestInit =
      typeof window === "undefined"
        ? { next: { revalidate: 3600 } } // Server-side: 1 hour
        : { cache: "no-store" }; // Client-side

    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCT_CATEGORIES}`,
      fetchOptions
    );

    if (!res.ok) {
      throw new Error("Failed to fetch categories");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * Search products by query string
 * @param query - Search query string
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 * @param sortBy - Sort option (newest, price-asc, price-desc, popular)
 * @returns Search results with pagination
 */
export interface SearchResponse {
  success: boolean;
  query: string;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export async function searchProducts(
  query: string,
  page: number = 1,
  limit: number = 20,
  sortBy?: string
): Promise<SearchResponse> {
  try {
    if (!query || query.trim() === "") {
      return {
        success: false,
        query: "",
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
        },
      };
    }

    const queryParams = new URLSearchParams({
      q: query.trim(),
      page: String(page),
      limit: String(limit),
    });

    if (sortBy) {
      queryParams.append("sort", sortBy);
    }

    const url = `${
      API_CONFIG.BASE_URL
    }/product/public/search?${queryParams.toString()}`;

    const res = await fetch(url, {
      cache: "no-store", // Always get fresh search results
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `Search failed: ${res.status}`,
        errorText.substring(0, 200)
      );
      throw new Error(`Search failed: ${res.status}`);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Search response is not JSON:", text.substring(0, 200));
      return {
        success: false,
        query: query.trim(),
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
        },
      };
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error searching products:", error);
    return {
      success: false,
      query: query.trim(),
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit,
      },
    };
  }
}
