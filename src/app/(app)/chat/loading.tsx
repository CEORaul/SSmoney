import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="flex h-[calc(100vh-14rem)] flex-col justify-end gap-4 rounded-lg border border-border/70 p-4">
        <Skeleton className="ml-auto h-10 w-2/5 rounded-lg" />
        <Skeleton className="h-16 w-3/5 rounded-lg" />
        <Skeleton className="ml-auto h-10 w-1/3 rounded-lg" />
      </div>
    </div>
  );
}
