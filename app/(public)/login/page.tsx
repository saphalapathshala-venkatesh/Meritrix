import { Card, CardBody } from "../../_components/Card";

export default function LoginPage() {
  return (
    <section className="mx-section">
      <div className="mx-container flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardBody>
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: "var(--text)" }}
            >
              Login
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-2)" }}>
              Authentication will be available after Prisma integration.
            </p>
            <div
              className="rounded-lg p-4 text-sm"
              style={{
                backgroundColor: "var(--primary-soft)",
                color: "var(--primary)",
              }}
            >
              Coming soon
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
