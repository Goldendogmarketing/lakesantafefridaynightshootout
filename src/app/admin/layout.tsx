import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Allow the login page to render without auth
  // The login page handles its own layout
  if (!session) {
    // We check if we're on the login page by not redirecting from layout
    // Instead, the individual admin pages will check auth
  }

  // If no session and not on login page, we still render children
  // because the login page is a child of this layout
  // The actual auth gate is done per-page or via middleware

  return (
    <div className="min-h-screen bg-gray-100">
      {session ? (
        <div className="flex">
          <AdminSidebar />
          <div className="flex-1 ml-0 md:ml-64">
            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
