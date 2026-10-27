import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-5 w-5 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="#DDE7E2" strokeWidth="3" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="#047857"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6"
      role="status"
      aria-live="polite"
    >
      <div className="relative h-24 w-24">
        <svg
          className="zb-orbit absolute inset-0 h-full w-full"
          viewBox="0 0 96 96"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="48"
            cy="48"
            r="44"
            stroke="#D4A017"
            strokeWidth="2.5"
            strokeDasharray="10 14"
            strokeLinecap="round"
          />
        </svg>
        <div className="zb-pulse absolute inset-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt=""
            className="h-full w-full"
            aria-hidden="true"
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className="text-sm font-medium text-[#334155]">{label}</span>
        <span className="flex gap-1 pl-1">
          <span className="zb-dot h-1.5 w-1.5 rounded-full bg-[#047857]" />
          <span className="zb-dot h-1.5 w-1.5 rounded-full bg-[#047857]" />
          <span className="zb-dot h-1.5 w-1.5 rounded-full bg-[#D4A017]" />
        </span>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
