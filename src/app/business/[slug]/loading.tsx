import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="flex items-start gap-5">
        <Skeleton className="h-20 w-20 rounded-xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-11 w-36 rounded-lg" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
