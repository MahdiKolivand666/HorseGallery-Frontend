/**
 * 🔒 Hook برای Auto-Refresh Token
 *
 * این hook به صورت خودکار Access Token را قبل از expire شدن refresh می‌کند
 */

import { useEffect, useRef, useState } from "react";
import { tokenStorage } from "@/lib/utils/tokenStorage";
import { refreshAccessToken } from "@/lib/api/client";

/**
 * ✅ Decode JWT token برای گرفتن expiration time
 */
function decodeToken(token: string): { exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

/**
 * ✅ Hook برای auto-refresh کردن Access Token قبل از expire
 * این hook هر 13 دقیقه یکبار (2 دقیقه قبل از expire) token را refresh می‌کند
 */
export function useTokenRefresh() {
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    tokenStorage.getAccessToken()
  );

  // ✅ Track token changes
  useEffect(() => {
    const checkToken = () => {
      const currentToken = tokenStorage.getAccessToken();
      if (currentToken !== token) {
        setToken(currentToken);
      }
    };

    // ✅ Check every 1 minute برای اطمینان
    const interval = setInterval(checkToken, 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const scheduleRefresh = async () => {
      // Clear previous timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) {
        return;
      }

      // ✅ Decode token برای گرفتن expiration time
      const decoded = decodeToken(accessToken);
      if (!decoded || !decoded.exp) {
        return;
      }

      const expiresAt = decoded.exp * 1000; // convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // ✅ اگر token قبلاً expire شده، فوراً refresh کن
      if (timeUntilExpiry <= 0) {
        try {
          await refreshAccessToken();
          // ✅ بعد از refresh، دوباره schedule کن
          scheduleRefresh();
        } catch (error) {
          console.error("Token refresh failed:", error);
          // ✅ اگر refresh failed، logout کن
          tokenStorage.clearAll();
          if (typeof window !== "undefined") {
            localStorage.removeItem("userInfo");
            window.location.href = "/";
          }
        }
        return;
      }

      // ✅ Refresh 2 دقیقه قبل از expire (برای اطمینان)
      const refreshTime = Math.max(0, timeUntilExpiry - 2 * 60 * 1000);

      if (refreshTime > 0) {
        refreshTimerRef.current = setTimeout(async () => {
          try {
            await refreshAccessToken();
            // ✅ بعد از refresh، دوباره schedule کن
            scheduleRefresh();
          } catch (error) {
            console.error("Token refresh failed:", error);
            // ✅ اگر refresh failed، logout کن
            tokenStorage.clearAll();
            if (typeof window !== "undefined") {
              localStorage.removeItem("userInfo");
              window.location.href = "/";
            }
          }
        }, refreshTime);
      } else {
        // ✅ اگر token نزدیک expire است، فوراً refresh کن
        try {
          await refreshAccessToken();
          scheduleRefresh();
        } catch (error) {
          console.error("Token refresh failed:", error);
          tokenStorage.clearAll();
          if (typeof window !== "undefined") {
            localStorage.removeItem("userInfo");
            window.location.href = "/";
          }
        }
      }
    };

    // ✅ Schedule اولیه
    scheduleRefresh();

    // ✅ Check هر 1 دقیقه برای اطمینان (backup mechanism)
    intervalTimerRef.current = setInterval(() => {
      scheduleRefresh();
    }, 60 * 1000); // هر 1 دقیقه

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
    };
  }, [token]); // ✅ Re-run when token changes
}
