/**
 * Component برای نمایش خطاهای validation زیر input ها
 */

interface FieldErrorProps {
  error?: string;
  className?: string;
}

export default function FieldError({ error, className = "" }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p className={`text-xs text-red-600 mt-1 ${className}`} role="alert">
      {error}
    </p>
  );
}
