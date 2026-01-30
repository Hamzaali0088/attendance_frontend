'use client';

/**
 * Fixed page header – same height on all authenticated pages.
 * Use as the first element inside each page content area.
 */
export default function PageHeader({ title }) {
  return (
    <header className="sticky top-0 z-10 h-[61px] flex items-center bg-white border-b border-black/10 px-4 lg:px-8 -mx-4 lg:-mx-8 shrink-0">
      <h1 className="text-2xl font-bold text-black">{title}</h1>
    </header>
  );
}
