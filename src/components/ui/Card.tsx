import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

const Card = ({
  children,
  className = "",
  hoverable = false,
  onClick,
}: CardProps) => {
  const Component = hoverable ? motion.div : "div";

  const hoverProps = hoverable
    ? {
        whileHover: { y: -10 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Component
      className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 ${
        hoverable ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
      {...hoverProps}
    >
      {children}
    </Component>
  );
};

export default Card;
