import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-gray-900 text-white hover:bg-gray-800",
    secondary: "bg-amber-500 text-white hover:bg-amber-600",
    outline:
      "bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white",
    ghost: "bg-transparent text-gray-900 hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-6 py-2 text-sm",
    md: "px-8 py-3 text-base",
    lg: "px-12 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="animate-spin h-5 w-5" />
          در حال بارگذاری...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
