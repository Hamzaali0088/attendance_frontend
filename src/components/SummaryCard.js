'use client';

export default function SummaryCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-black/80">{title}</p>
          <p className="text-2xl font-bold mt-1 text-black">{value}</p>
        </div>
        {Icon && (
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
