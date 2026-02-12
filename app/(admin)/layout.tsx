import AdminNavbar from "../_components/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminNavbar />
      <main className="flex-1 mx-container py-10">{children}</main>
    </div>
  );
}
