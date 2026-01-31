'use client';

/**
 * Skeleton placeholder – use with animate-pulse for loading states.
 */
export default function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded bg-black/10 ${className}`}
      {...props}
    />
  );
}

/**
 * Table skeleton – header row + N body rows with given column counts.
 */
export function TableSkeleton({ rows = 5, cols = 4, headers = null, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-black/10 bg-white ${className}`}>
      <table className="min-w-full divide-y divide-black/10">
        <thead className="bg-white sticky top-0 z-[1] border-b border-black/10">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th
                key={i}
                className={`px-4 py-3 text-left text-xs font-semibold text-black uppercase ${
                  i === cols - 1 ? 'text-right' : ''
                }`}
              >
                {Array.isArray(headers) && headers[i] ? headers[i] : <Skeleton className="h-4 w-20" />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/10">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <td key={colIndex} className={`px-4 py-3 ${colIndex === cols - 1 ? 'text-right' : ''}`}>
                  <Skeleton
                    className={`h-4 ${colIndex === 0 ? 'w-28' : colIndex === cols - 1 ? 'w-16 ml-auto' : 'w-24'}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Card row skeleton – for employee/attendance control list items. */
export function CardRowSkeleton({ className = '' }) {
  return (
    <div
      className={`rounded-xl border border-black/10 border-t-4 border-t-primary bg-white overflow-hidden ${className}`}
    >
      <div className="px-5 py-4 bg-black/5 border-b border-black/10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
