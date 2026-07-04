import { Skeleton } from "@/components/ui/skeleton"

export default function BillsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="size-8 rounded-lg" />
      </div>

      <Skeleton className="h-44 w-full rounded-xl" />

      <div className="space-y-6">
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
