export default function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="mx-container py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            &copy; {new Date().getFullYear()} Meritrix. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Terms", "Privacy", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: "var(--muted)" }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
