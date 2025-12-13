"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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
    size?: string
  ) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  mergeCart: () => Promise<void>;
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

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await getCart();
      setCart(cartData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "خطا در دریافت سبد خرید";
      setError(errorMessage);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = async (
    productId: string,
    quantity: number = 1,
    size?: string
  ) => {
    try {
      setError(null);
      const updatedCart = await addToCartAPI(productId, quantity, size);
      setCart(updatedCart);
      setIsCartOpen(true);
    } catch (err) {
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

  // بررسی اینکه آیا کاربر مهمان است
  const isGuest = !cart?.cart?.user && !!cart?.cart?.sessionId;

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
