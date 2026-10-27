import { CheckCircle2, Clock, AlertTriangle, XCircle, HelpCircle, RefreshCw, XOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/generated/prisma";

interface TrustBadgeProps {
  status: VerificationStatus;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

const config: Record<VerificationStatus, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  VERIFIED: { icon: CheckCircle2, color: "text-[#059669]", bg: "bg-[#059669]/10", label: "Verified" },
  PENDING: { icon: Clock, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", label: "Pending" },
  MORE_INFO_REQUIRED: { icon: AlertTriangle, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", label: "More info required" },
  NOT_SUBMITTED: { icon: HelpCircle, color: "text-[#64748B]", bg: "bg-[#F1F5F4]", label: "Not submitted" },
  REJECTED: { icon: XCircle, color: "text-[#DC2626]", bg: "bg-[#DC2626]/10", label: "Rejected" },
  EXPIRED: { icon: Clock, color: "text-[#64748B]", bg: "bg-[#F1F5F4]", label: "Expired" },
  REVOKED: { icon: XOctagon, color: "text-[#DC2626]", bg: "bg-[#DC2626]/10", label: "Revoked" },
  UNABLE_TO_VERIFY: { icon: HelpCircle, color: "text-[#64748B]", bg: "bg-[#F1F5F4]", label: "Unable to verify" },
};

export function TrustBadge({ status, label, size = "sm", className }: TrustBadgeProps) {
  const c = config[status];
  const Icon = c.icon;
  const sizes = {
    sm: { icon: 14, text: "text-xs", px: "px-2 py-0.5", gap: "gap-1" },
    md: { icon: 16, text: "text-sm", px: "px-2.5 py-1", gap: "gap-1.5" },
  };
  const s = sizes[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        c.bg,
        c.color,
        s.text,
        s.px,
        s.gap,
        className
      )}
    >
      <Icon size={s.icon} aria-hidden="true" />
      {label ?? c.label}
    </span>
  );
}
