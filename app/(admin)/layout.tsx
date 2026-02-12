import { requireAdmin } from "@/lib/guards";
import AdminNavbar from "../_components/AdminNavbar";
import { AdminProviders } from "./providers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <AdminProviders>
      <div className="flex flex-col min-h-screen">
        <AdminNavbar userName={user.name} />
        <main className="flex-1 mx-container py-10">{children}</main>
      </div>
    </AdminProviders>
  );
}
