"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  CartResponse,
  CartItem,
  getCart,
  addToCart as addToCartAPI,
  updateCartItem,
  removeFromCart as removeFromCartAPI,
  mergeCart as mergeCartAPI,
} from "@/lib/api/cart";
import { isLoggedIn } from "@/lib/api/auth";
import {
  isIncompleteRegistrationError,
  isOtpVerificationExpiredError,
  isOtpRequiredError,
} from "@/types/errors";

interface CartContextType {
  cart: CartResponse | null;
  loading: boolean;
  error: string | null;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  reloadCart: () => Promise<void>;
  addToCart: (
    productId: string,
    quantity?: number,
    size?: string,
    onLoginRequired?: () => void
  ) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  mergeCart: () => Promise<void>;
  clearCart: () => void; // ✅ جدید: پاک کردن cart از state
  // Helper values
  totalItems: number;
  totalPrice: number;
  itemCount: number;
  remainingSeconds: number;
  isGuest: boolean; // آیا کاربر مهمان است؟
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // ✅ استفاده از useRef برای جلوگیری از double call در development mode (فقط برای mount اولیه)
  const hasLoadedOnMountRef = useRef(false);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await getCart();

      // ✅ طبق مستندات جدید backend: cart expired را از state پاک نمی‌کنیم
      // ✅ فقط cart را set می‌کنیم (حتی اگر expired باشد)
      // ✅ UI باید expired flag را بررسی کند و checkout را disable کند
      setCart(cartData);
    } catch (err) {
      // ✅ بررسی اینکه آیا error مربوط به rate limit است
      const errorWithStatus = err as Error & { statusCode?: number; code?: string };
      if (errorWithStatus.statusCode === 429 || errorWithStatus.code === "RATE_LIMIT_EXCEEDED") {
        // ✅ Rate limit - به صورت silent handle می‌کنیم (بدون setError)
        // ✅ cart را null نمی‌کنیم - آخرین state را نگه می‌داریم
        return;
      }

      // ✅ فقط برای سایر errors، error را در state قرار می‌دهیم
      const errorMessage =
        err instanceof Error ? err.message : "خطا در دریافت سبد خرید";
      setError(errorMessage);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cart on mount - فقط یک بار (جلوگیری از double call در development mode)
  useEffect(() => {
    // ✅ جلوگیری از double call فقط در mount اولیه
    if (hasLoadedOnMountRef.current) return;
    hasLoadedOnMountRef.current = true;
    
    loadCart();
  }, [loadCart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = async (
    productId: string,
    quantity: number = 1,
    size?: string,
    onLoginRequired?: () => void
  ) => {
    // ✅ چک کردن اینکه آیا کاربر لاگین است
    if (!isLoggedIn()) {
      // اگر callback برای باز کردن modal وجود دارد، آن را صدا بزن
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        // اگر callback وجود ندارد، خطا بده
        throw new Error("برای افزودن محصول به سبد خرید باید وارد شوید");
      }
      return;
    }

    try {
      setError(null);
      const updatedCart = await addToCartAPI(productId, quantity, size);
      setCart(updatedCart);
      setIsCartOpen(true);
    } catch (err) {
      // err ممکن است یک Error instance با properties اضافی باشد
      const errorWithDetails = err as Error & {
        statusCode?: number;
        code?: string;
        requiresRegistration?: boolean;
        isAuthenticated?: boolean;
        requiresOtpVerification?: boolean;
        phoneNumber?: string | null;
      };

      // ✅ مهم: اول چک کن که آیا OTP_REQUIRED است
      if (isOtpRequiredError(errorWithDetails)) {
        // ✅ کاربر لاگین است اما OTP verify نشده - خطا را throw کن تا component بتواند handle کند
        // ⚠️ خطا را در state یا console نمایش نده - این یک flow عادی است
        throw err;
      }

      // ✅ سپس چک کن که آیا OTP_VERIFICATION_EXPIRED است
      if (isOtpVerificationExpiredError(errorWithDetails)) {
        // ✅ احراز هویت منقضی شده - خطا را throw کن تا component بتواند handle کند
        // ⚠️ خطا را در state یا console نمایش نده - این یک flow عادی است
        throw err;
      }

      // ✅ سپس چک کن که آیا INCOMPLETE_REGISTRATION است
      if (isIncompleteRegistrationError(errorWithDetails)) {
        // ✅ کاربر لاگین است اما اطلاعات کامل ندارد
        // ⚠️ خطا را در state یا console نمایش نده - این یک flow عادی است
        // خطا را throw کن تا component بتواند modal را باز کند
        throw err;
      }

      // ✅ فقط خطاهای غیر INCOMPLETE_REGISTRATION را در state و console نمایش بده
      const errorMessage =
        err instanceof Error ? err.message : "خطا در افزودن محصول";
      setError(errorMessage);
      throw err;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setError(null);
      const updatedCart = await removeFromCartAPI(itemId);
      setCart(updatedCart);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "خطا در حذف محصول";
      setError(errorMessage);
      // اگر خطای 403 (Forbidden) رخ داد، سبد را reload کن
      if (
        errorMessage.includes("دسترسی") ||
        errorMessage.includes("Forbidden")
      ) {
        await loadCart();
      }
      throw err;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }
      setError(null);
      const updatedCart = await updateCartItem(itemId, quantity);
      setCart(updatedCart);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "خطا در به‌روزرسانی تعداد";
      setError(errorMessage);
      // اگر خطای 403 (Forbidden) رخ داد، سبد را reload کن
      if (
        errorMessage.includes("دسترسی") ||
        errorMessage.includes("Forbidden")
      ) {
        await loadCart();
      }
      throw err;
    }
  };

  const mergeCart = async () => {
    try {
      setError(null);
      const mergedCart = await mergeCartAPI();
      setCart(mergedCart);
      // بعد از merge موفق، سبد را reload کن
      await loadCart();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "خطا در merge کردن سبد";
      setError(errorMessage);
      // اگر merge خطا داد، فقط سبد را reload کن
      await loadCart();
    }
  };

  // ✅ Function برای پاک کردن cart از state (بعد از expired error در checkout)
  const clearCart = useCallback(() => {
    setCart(null);
    setError(null);
    // ✅ پاک کردن cartId از localStorage/cookie اگر وجود دارد
    if (typeof window !== "undefined") {
      // اگر sessionId در cookie است، آن را پاک نمی‌کنیم (ممکن است برای مهمان باشد)
      // فقط cart state را پاک می‌کنیم
    }
  }, []);

  // بررسی اینکه آیا کاربر مهمان است
  const isGuest = !cart?.cart?.userId && !!cart?.cart?.sessionId; // ✅ تغییر از user به userId

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        isCartOpen,
        openCart,
        closeCart,
        reloadCart: loadCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        mergeCart,
        clearCart, // ✅ اضافه کردن clearCart
        // Helper values from backend
        totalItems: cart?.totalItems || 0,
        totalPrice: cart?.totalPrice || 0,
        itemCount: cart?.itemCount || 0,
        remainingSeconds: cart?.remainingSeconds || 0,
        isGuest,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Backward compatibility - export old CartItem type for components that still use it
export type { CartItem };
