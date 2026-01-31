'use client';

/**
 * Fixed page header – same height on all authenticated pages.
 * Use as the first element inside each page content area.
 * Optional `actions` renders on the right (e.g. Send Excuse button).
 */
export default function PageHeader({ title, actions }) {
  return (
    <header className="sticky top-0 z-10 h-[61px] flex items-center justify-between gap-4 bg-white border-b border-black/10 px-4 lg:px-8 -mx-4 lg:-mx-8 shrink-0">
      <h1 className="text-2xl font-bold text-black">{title}</h1>
      {actions && <div className="flex items-center shrink-0">{actions}</div>}
    </header>
  );
}
