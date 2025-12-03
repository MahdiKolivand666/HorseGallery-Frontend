"use client";

import { createContext, useContext, useState, ReactNode } from "react";

import { GoldInfo } from "@/lib/api/products";

interface CartItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  code: string;
  weight: string;
  size?: string;
  slug: string;
  category: string;
  discount?: number;
  // ✨ فیلدهای جدید برای سکه و شمش
  productType?: "jewelry" | "coin" | "melted_gold";
  goldInfo?: GoldInfo;
}

interface CartContextType {
  isCartOpen: boolean;
  cartItems: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (_id: string) => void;
  updateQuantity: (_id: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      // ✨ برای سکه: فقط _id رو چک کن (چون size نداره)
      // برای بقیه: _id و size رو چک کن
      const existingItem = prev.find((i) => {
        if (item.productType === "coin") {
          return i._id === item._id && i.productType === "coin";
        }
        return i._id === item._id && i.size === item.size;
      });
      
      if (existingItem) {
        return prev.map((i) => {
          if (item.productType === "coin") {
            return i._id === item._id && i.productType === "coin"
              ? { ...i, quantity: i.quantity + 1 }
              : i;
          }
          return i._id === item._id && i.size === item.size
            ? { ...i, quantity: i.quantity + 1 }
            : i;
        });
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    openCart();
  };

  const removeFromCart = (_id: string) => {
    setCartItems((prev) => prev.filter((item) => item._id !== _id));
  };

  const updateQuantity = (_id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(_id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item._id === _id ? { ...item, quantity } : item))
    );
  };

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        cartItems,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
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
