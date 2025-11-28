/**
 * FAQ API Functions
 */

import API_CONFIG from "@/config/api";

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
  views: number;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export async function getFAQs(): Promise<FAQ[]> {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FAQ}`;
    
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // 1 hour
    });

    if (!res.ok) {
      throw new Error("Failed to fetch FAQs");
    }

    const data = await res.json();
    
    // اگه مستقیم array باشه، برگردون
    if (Array.isArray(data)) {
      return data;
    }
    
    // اگه object با data property باشه
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data;
    }
    
    // در غیر این صورت، خالی برگردون
    return [];
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
}
