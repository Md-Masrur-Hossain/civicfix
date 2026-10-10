import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const statusSteps = [
  { label: "New", tone: "status-new", description: "Just reported" },
  { label: "In progress", tone: "status-in-progress", description: "Being looked at" },
  { label: "Resolved", tone: "status-resolved", description: "Marked as sorted" },
];

export default function AdminPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell inner-page admin-page">
        <div className="page-kicker">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><span>Admin preview</span>
        </div>
        <section className="admin-hero">
          <span className="admin-icon" aria-hidden="true">⌘</span>
          <span className="eyebrow">A look behind the scenes</span>
          <h1>Admin preview</h1>
          <p>This is a placeholder for a future review workspace. There are no admin tools or live reports here yet.</p>
          <span className="coming-soon">COMING LATER</span>
        </section>

        <section className="admin-preview-card">
          <div className="admin-card-heading">
            <div>
              <span className="tiny-label">STATUS FLOW PREVIEW</span>
              <h2>A clear update, at every step.</h2>
            </div>
            <span className="view-only-badge">View only</span>
          </div>
          <p className="admin-card-copy">In a future version, an admin could review a report and set its status. These examples are for illustration only.</p>
          <div className="status-flow">
            {statusSteps.map((step, index) => (
              <div className="status-flow-item" key={step.label}>
                <span className={`${step.tone} status-pill`}><i />{step.label}</span>
                <span className="flow-description">{step.description}</span>
                {index < statusSteps.length - 1 && <span className="flow-arrow" aria-hidden="true">→</span>}
              </div>
            ))}
          </div>
          <div className="admin-callout">
            <span aria-hidden="true">i</span>
            <p>Demo only: CivicFix is not connected to a municipality, and this page cannot change report statuses.</p>
          </div>
        </section>

        <div className="inner-page-actions">
          <Link className="text-link" href="/">← Back to home</Link>
          <Link className="button button-primary" href="/issues">View sample reports <span aria-hidden="true">↗</span></Link>
        </div>
      </main>
      <footer className="site-footer page-shell">
        <span>© CivicFix demo</span>
        <span>Sample content only · Not connected to city services</span>
      </footer>
    </>
  );
}
