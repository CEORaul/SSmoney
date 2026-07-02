import { Skeleton } from "@/components/ui/skeleton";

function GroupSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-border/70 p-6">
      <Skeleton className="h-5 w-28" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CategoriesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-36" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GroupSkeleton />
        <GroupSkeleton />
      </div>
    </div>
  );
}
