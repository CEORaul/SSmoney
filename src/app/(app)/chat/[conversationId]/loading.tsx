import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-14rem)] flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden rounded-lg border">
        <div className="hidden w-64 shrink-0 border-r p-3 md:block">
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
        <div className="flex flex-1 flex-col justify-end gap-4 p-4">
          <Skeleton className="ml-auto h-10 w-2/5 rounded-lg" />
          <Skeleton className="h-16 w-3/5 rounded-lg" />
          <Skeleton className="ml-auto h-10 w-1/3 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
