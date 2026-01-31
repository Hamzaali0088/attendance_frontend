'use client';

export default function SummaryCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-lg shadow-card border border-black/10 border-t-2 border-t-primary px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-black/80 truncate">{title}</p>
          <p className="text-lg font-bold mt-0.5 text-black tabular-nums">{value}</p>
        </div>
        {Icon && (
          <div className="shrink-0 p-2 rounded-md bg-primary/10 text-primary">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
