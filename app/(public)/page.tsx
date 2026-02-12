import Button from "../_components/Button";
import { Card, CardBody } from "../_components/Card";

const features = [
  {
    title: "Worksheets",
    description:
      "Structured, curriculum-aligned practice sheets with instant grading and detailed explanations.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Merit Drills",
    description:
      "Adaptive daily drills that target weak areas, build speed, and track XP over time.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Live Sessions",
    description:
      "Join expert-led sessions with real-time problem solving, Q&A, and collaborative learning.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 10l-4 3V7l4 3z" fill="currentColor" />
        <rect x="3" y="4" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const plans = [
  { name: "Free", price: "$0", features: "5 worksheets / month, basic drills" },
  { name: "Pro", price: "$12", features: "Unlimited access, analytics, priority support" },
  { name: "Team", price: "$29", features: "Everything in Pro + admin tools, bulk licenses" },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-section">
        <div className="mx-container text-center">
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight leading-tight"
            style={{ color: "var(--text)" }}
          >
            Master every subject with
            <br />
            <span style={{ color: "var(--primary)" }}>structured practice</span>
          </h1>
          <p
            className="mt-5 text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--text-2)" }}
          >
            Worksheets, adaptive drills, and live sessions designed to build
            deep understanding and real confidence.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Button>Get started free</Button>
            <Button variant="secondary">See how it works</Button>
          </div>
        </div>
      </section>

      <section className="mx-section" style={{ backgroundColor: "var(--surface)" }}>
        <div className="mx-container">
          <h2
            className="text-2xl font-semibold text-center mb-10"
            style={{ color: "var(--text)" }}
          >
            Everything you need to excel
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title}>
                <CardBody>
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: "var(--primary-soft)",
                      color: "var(--primary)",
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3
                    className="text-base font-semibold mb-2"
                    style={{ color: "var(--text)" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                    {f.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-section">
        <div className="mx-container">
          <h2
            className="text-2xl font-semibold text-center mb-10"
            style={{ color: "var(--text)" }}
          >
            Simple, transparent pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <Card key={p.name} className={i === 1 ? "ring-2" : ""} style={i === 1 ? { "--tw-ring-color": "var(--primary)" } as React.CSSProperties : undefined}>
                <CardBody>
                  <p
                    className="text-sm font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "var(--primary)" }}
                  >
                    {p.name}
                  </p>
                  <p
                    className="text-3xl font-bold mb-1"
                    style={{ color: "var(--text)" }}
                  >
                    {p.price}
                    <span
                      className="text-sm font-normal ml-1"
                      style={{ color: "var(--muted)" }}
                    >
                      /mo
                    </span>
                  </p>
                  <p className="text-sm mb-5" style={{ color: "var(--text-2)" }}>
                    {p.features}
                  </p>
                  <Button
                    variant={i === 1 ? "primary" : "secondary"}
                    className="w-full"
                  >
                    {i === 0 ? "Start free" : "Get started"}
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        className="mx-section text-center"
        style={{ backgroundColor: "var(--primary-soft)" }}
      >
        <div className="mx-container">
          <h2
            className="text-2xl font-semibold mb-4"
            style={{ color: "var(--text)" }}
          >
            Ready to level up?
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-2)" }}>
            Join thousands of students building real mastery every day.
          </p>
          <Button>Create your free account</Button>
        </div>
      </section>
    </>
  );
}
