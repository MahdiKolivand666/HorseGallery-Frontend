/**
 * 🔒 Token Storage Utility
 *
 * ✅ Access Token: در memory نگه دارید (برای امنیت بیشتر)
 * ❌ NOT در localStorage (XSS vulnerability)
 *
 * ✅ Refresh Token: در secure storage نگه دارید
 */

// ✅ Access Token: در memory و localStorage نگه دارید (برای persistence بعد از reload)
let accessToken: string | null = null;

// ✅ Initialize: بارگذاری token از localStorage به memory در startup (فقط client-side)
function initializeTokenFromStorage() {
  if (typeof window !== "undefined") {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      accessToken = storedToken;
    }
  }
}

// ✅ اجرای initialization بلافاصله (فقط در client-side)
if (typeof window !== "undefined") {
  initializeTokenFromStorage();
}

export const tokenStorage = {
  // Access Token (Memory + localStorage برای persistence)
  setAccessToken(token: string) {
    accessToken = token;
    // ✅ همچنین در localStorage نگه دارید تا بعد از reload باقی بماند
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  },

  getAccessToken(): string | null {
    // ✅ ابتدا از memory بخوانید، اگر نبود از localStorage
    if (accessToken) {
      return accessToken;
    }
    // ✅ اگر در memory نبود، از localStorage بخوانید (بعد از reload)
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        accessToken = storedToken; // ✅ sync با memory
        return storedToken;
      }
    }
    return null;
  },

  clearAccessToken() {
    accessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
  },

  // Refresh Token (Secure Storage)
  setRefreshToken(token: string) {
    // ✅ استفاده از localStorage (fallback)
    // TODO: بهتر است در httpOnly cookie نگه داشته شود (backend باید set کند)
    if (typeof window !== "undefined") {
      localStorage.setItem("refreshToken", token);
    }
  },

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  },

  clearRefreshToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("refreshToken");
    }
  },

  // Clear all tokens
  clearAll() {
    this.clearAccessToken();
    this.clearRefreshToken();
  },

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.getAccessToken() !== null;
  },
};
