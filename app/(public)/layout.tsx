import PublicNavbar from "../_components/PublicNavbar";
import Footer from "../_components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
