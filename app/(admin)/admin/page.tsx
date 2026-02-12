import { Card, CardHeader, CardBody } from "../../_components/Card";
import Badge from "../../_components/Badge";

const sections = [
  { title: "Users", count: "1,248", description: "Manage student and teacher accounts" },
  { title: "Worksheets", count: "342", description: "Create and manage worksheet content" },
  { title: "Drills", count: "186", description: "Configure adaptive drill parameters" },
  { title: "Live Sessions", count: "24", description: "Schedule and manage live sessions" },
  { title: "Analytics", count: "—", description: "View platform usage and performance" },
  { title: "Settings", count: "—", description: "Platform configuration and billing" },
];

export default function AdminPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            Admin Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
            Manage your platform content and users.
          </p>
        </div>
        <Badge>Admin</Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {sections.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {s.title}
                </p>
                {s.count !== "—" && (
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--primary)" }}
                  >
                    {s.count}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm" style={{ color: "var(--text-2)" }}>
                {s.description}
              </p>
              <a
                href="#"
                className="inline-block mt-3 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "var(--primary)" }}
              >
                Manage &rarr;
              </a>
            </CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}
