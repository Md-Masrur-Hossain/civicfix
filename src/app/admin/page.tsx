import Link from "next/link";
import { AdminReview } from "@/components/admin-review";
import { SiteHeader } from "@/components/site-header";

export default function AdminPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell inner-page admin-page">
        <div className="page-kicker">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><span>Admin demo</span>
        </div>
        <section className="admin-hero">
          <span className="admin-icon" aria-hidden="true">⌘</span>
          <span className="eyebrow">Browser-only demo workspace</span>
          <h1>Review reports</h1>
          <p>Preview how report status updates could work. There is no sign-in, and changes stay in this browser.</p>
          <span className="coming-soon">DEMO ONLY · NOT SECURE ADMIN</span>
        </section>

        <div className="demo-notice" role="note">
          <span className="notice-icon" aria-hidden="true">i</span>
          <p><strong>Not connected to a city team.</strong> Status changes are saved locally in this browser only; they are not shared with other browsers or municipal services.</p>
        </div>

        <AdminReview />

        <div className="inner-page-actions">
          <Link className="text-link" href="/">← Back to home</Link>
          <Link className="button button-primary" href="/issues">View resident issues <span aria-hidden="true">↗</span></Link>
        </div>
      </main>
      <footer className="site-footer page-shell">
        <span>© CivicFix demo</span>
        <span>Browser-only data · Not connected to city services</span>
      </footer>
    </>
  );
}
