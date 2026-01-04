"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string;
  height?: string;
}

export const Skeleton = ({
  className = "",
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) => {
  const baseClasses = "animate-pulse bg-gray-200";

  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// ✅ Product Skeleton (Responsive)
export const ProductSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="border rounded-lg p-3 sm:p-4 animate-pulse"
        >
          {/* Image */}
          <Skeleton
            className="h-40 sm:h-48 w-full mb-3 sm:mb-4"
            variant="rectangular"
          />
          {/* Title */}
          <Skeleton className="h-5 sm:h-6 w-3/4 mb-2" variant="text" />
          {/* Description */}
          <Skeleton className="h-4 w-full mb-2" variant="text" />
          <Skeleton className="h-4 w-2/3 mb-3 sm:mb-4" variant="text" />
          {/* Price */}
          <Skeleton className="h-6 sm:h-8 w-1/2" variant="text" />
        </div>
      ))}
    </div>
  );
};

// ✅ Blog Post Skeleton
export const BlogPostSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg overflow-hidden animate-pulse">
          {/* Image */}
          <Skeleton className="h-48 sm:h-64 w-full" variant="rectangular" />
          <div className="p-4 sm:p-6">
            {/* Title */}
            <Skeleton className="h-6 sm:h-7 w-full mb-3" variant="text" />
            <Skeleton className="h-6 sm:h-7 w-3/4 mb-4" variant="text" />
            {/* Excerpt */}
            <Skeleton className="h-4 w-full mb-2" variant="text" />
            <Skeleton className="h-4 w-full mb-2" variant="text" />
            <Skeleton className="h-4 w-2/3 mb-4" variant="text" />
            {/* Meta */}
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" variant="text" />
              <Skeleton className="h-4 w-16" variant="text" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ✅ FAQ Skeleton
export const FAQSkeleton = () => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="border rounded-lg p-4 sm:p-5 animate-pulse"
        >
          <Skeleton className="h-5 sm:h-6 w-full mb-3" variant="text" />
          <Skeleton className="h-4 w-3/4" variant="text" />
        </div>
      ))}
    </div>
  );
};
