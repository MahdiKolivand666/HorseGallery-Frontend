"use client";

import { CartProvider } from "@/contexts/CartContext";
import { TokenRefreshProvider } from "./TokenRefreshProvider";
import { ReactNode } from "react";

export default function CartProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <TokenRefreshProvider>
      <CartProvider>{children}</CartProvider>
    </TokenRefreshProvider>
  );
}
