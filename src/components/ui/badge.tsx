import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gold"
  | "neutral"
  | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-[#047857] text-white",
  success: "bg-[#059669]/10 text-[#059669] border border-[#059669]/20",
  warning: "bg-[#F59E0B]/10 text-[#92400E] border border-[#F59E0B]/20",
  danger: "bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20",
  info: "bg-blue-50 text-blue-700 border border-blue-200",
  gold: "bg-[#D4A017]/10 text-[#92400E] border border-[#D4A017]/20",
  neutral: "bg-[#F1F5F4] text-[#334155] border border-[#DDE7E2]",
  outline: "border border-[#DDE7E2] text-[#334155] bg-transparent",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
