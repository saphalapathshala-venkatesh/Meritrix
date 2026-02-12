import StudentNavbar from "../_components/StudentNavbar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <StudentNavbar />
      <main className="flex-1 mx-container py-10">{children}</main>
    </div>
  );
}
