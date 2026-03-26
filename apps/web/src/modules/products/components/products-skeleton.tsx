export function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white"
          aria-hidden="true"
        >
          <div className="aspect-square animate-pulse bg-gray-100" />
          <div className="flex flex-col gap-2 p-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-gray-100" />
            <div className="mt-2 h-5 w-1/3 animate-pulse rounded bg-gray-100" />
            <div className="mt-1 h-9 w-full animate-pulse rounded-xl bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
