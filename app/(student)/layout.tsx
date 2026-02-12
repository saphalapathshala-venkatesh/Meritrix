import { requireUser } from "@/lib/guards";
import StudentNavbar from "../_components/StudentNavbar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex flex-col min-h-screen">
      <StudentNavbar userName={user.name} />
      <main className="flex-1 mx-container py-10">{children}</main>
    </div>
  );
}
