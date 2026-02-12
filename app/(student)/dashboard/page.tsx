import { Card, CardHeader, CardBody } from "../../_components/Card";
import Badge from "../../_components/Badge";
import ProgressBar from "../../_components/ProgressBar";

export default function StudentDashboard() {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
            Welcome back! Here is your learning overview.
          </p>
        </div>
        <Badge>Pro Plan</Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Overall Progress
            </p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold mb-4" style={{ color: "var(--text)" }}>
              68%
            </p>
            <ProgressBar value={68} label="Course completion" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Merit XP
            </p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold mb-1" style={{ color: "var(--text)" }}>
              2,340
            </p>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>
              +120 this week
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Upcoming Sessions
            </p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold mb-1" style={{ color: "var(--text)" }}>
              3
            </p>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>
              Next: Tomorrow 4:00 PM
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Subject Progress
          </p>
        </CardHeader>
        <CardBody className="flex flex-col gap-5">
          <ProgressBar value={85} label="Mathematics" />
          <ProgressBar value={62} label="Science" />
          <ProgressBar value={44} label="English" />
          <ProgressBar value={91} label="History" />
        </CardBody>
      </Card>
    </>
  );
}
