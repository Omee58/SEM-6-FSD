export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-[#E8E8E4] rounded-lg ${className}`} />
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
      <Skeleton className="h-48 rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function BookingRowSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E4] p-5 flex gap-4">
      <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <div className="grid grid-cols-4 gap-3">
          <Skeleton className="h-3" />
          <Skeleton className="h-3" />
          <Skeleton className="h-3" />
          <Skeleton className="h-3" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E4] p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="w-9 h-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  );
}
