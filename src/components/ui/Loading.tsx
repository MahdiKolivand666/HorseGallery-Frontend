"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
  className?: string;
  variant?: "spinner" | "dots" | "pulse";
}

export const Loading = ({
  size = "md",
  text,
  fullScreen = false,
  className = "",
  variant = "spinner",
}: LoadingProps) => {
  const t = useTranslations("common");
  const defaultText = text || t("loading");

  // ✅ Responsive sizes برای mobile
  const sizes = {
    sm: "h-4 w-4 sm:h-5 sm:w-5", // Mobile: 16px, Desktop: 20px
    md: "h-8 w-8 sm:h-12 sm:w-12", // Mobile: 32px, Desktop: 48px
    lg: "h-12 w-12 sm:h-16 sm:w-16", // Mobile: 48px, Desktop: 64px
    xl: "h-16 w-16 sm:h-24 sm:w-24", // Mobile: 64px, Desktop: 96px
  };

  const textSizes = {
    sm: "text-xs sm:text-sm",
    md: "text-sm sm:text-base",
    lg: "text-base sm:text-lg",
    xl: "text-lg sm:text-xl",
  };

  const renderSpinner = () => {
    switch (variant) {
      case "spinner":
        return (
          <Loader2 className={`${sizes[size]} animate-spin text-primary`} />
        );
      case "dots":
        return (
          <div className="flex gap-1.5 sm:gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizes[size]} rounded-full bg-primary animate-pulse`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        );
      case "pulse":
        return (
          <div
            className={`${sizes[size]} rounded-full bg-primary animate-pulse`}
          />
        );
    }
  };

  const content = (
    <div className={`flex flex-col items-center gap-3 sm:gap-4 ${className}`}>
      {renderSpinner()}
      {defaultText && (
        <p
          className={`${textSizes[size]} text-gray-600 animate-pulse px-4 text-center`}
        >
          {defaultText}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        {content}
      </div>
    );
  }

  return content;
};
