import { CheckCircle2, Clock, AlertTriangle, XCircle, HelpCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FreshnessLabel } from "@/generated/prisma";

interface FreshnessIndicatorProps {
  freshness: FreshnessLabel;
  className?: string;
}

const config: Record<FreshnessLabel, { icon: typeof CheckCircle2; color: string; label: string }> = {
  RECONFIRMED_THIS_WEEK: { icon: CheckCircle2, color: "text-[#059669]", label: "Reconfirmed this week" },
  RECONFIRMED_THIS_MONTH: { icon: CheckCircle2, color: "text-[#059669]", label: "Reconfirmed this month" },
  UPDATED_QUARTER_AGO: { icon: Clock, color: "text-[#64748B]", label: "Updated 3 months ago" },
  MAY_BE_OUTDATED: { icon: AlertTriangle, color: "text-[#F59E0B]", label: "Information may be outdated" },
  TEMPORARILY_UNREACHABLE: { icon: AlertTriangle, color: "text-[#F59E0B]", label: "Temporarily unreachable" },
  CLOSED: { icon: XCircle, color: "text-[#DC2626]", label: "Closed or no longer operating" },
  UNKNOWN: { icon: HelpCircle, color: "text-[#64748B]", label: "Freshness unknown" },
};

export function FreshnessIndicator({ freshness, className }: FreshnessIndicatorProps) {
  const c = config[freshness];
  const Icon = c.icon;

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", c.color, className)}>
      <Icon size={14} aria-hidden="true" />
      {c.label}
    </span>
  );
}
