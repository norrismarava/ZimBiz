import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number | null | undefined;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  count?: number | null;
  className?: string;
}

const sizeMap = {
  sm: { star: 14, text: "text-xs" },
  md: { star: 16, text: "text-sm" },
  lg: { star: 20, text: "text-base" },
};

export function RatingStars({ rating, size = "md", showNumber = true, count, className }: RatingStarsProps) {
  const s = sizeMap[size];

  if (rating === null || rating === undefined) {
    return (
      <span className={cn("text-[#64748B] italic", s.text, className)}>
        No ratings yet
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={s.star}
            className={
              star <= Math.round(rating)
                ? "fill-[#D4A017] text-[#D4A017]"
                : "fill-[#DDE7E2] text-[#DDE7E2]"
            }
            aria-hidden="true"
          />
        ))}
      </div>
      {showNumber && (
        <span className={cn("font-medium text-[#334155]", s.text)}>
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && count !== null && (
        <span className={cn("text-[#64748B]", s.text)}>
          ({count})
        </span>
      )}
    </div>
  );
}
