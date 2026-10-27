import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
