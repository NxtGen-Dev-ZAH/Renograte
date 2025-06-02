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
      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
    </AdminProtected>
  );
} 