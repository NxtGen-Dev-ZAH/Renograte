import AdminProtected from '@/components/AdminProtected';

export const metadata = {
  title: 'Admin Dashboard | Renograte',
  description: 'Manage your Renograte platform',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtected>
      {children}
    </AdminProtected>
  );
} 