"use client";

import { useTokenRefresh } from "@/hooks/useTokenRefresh";

/**
 * ✅ Provider برای Auto-Refresh Token
 * این component باید در root layout قرار بگیرد
 */
export function TokenRefreshProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Auto-refresh token
  useTokenRefresh();

  return <>{children}</>;
}
