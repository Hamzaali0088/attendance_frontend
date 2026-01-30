import DashboardLayout from '@/components/DashboardLayout';

export default function AuthenticatedLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
