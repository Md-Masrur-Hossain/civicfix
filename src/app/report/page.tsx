import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ReportForm } from "@/components/report-form";

export default function ReportPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell inner-page report-page">
        <div className="page-kicker">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><span>Report an issue</span>
        </div>
        <section className="report-heading">
          <span className="eyebrow"><span className="eyebrow-dot" />A neighbourly heads-up</span>
          <h1>What needs a<br /><span>little attention?</span></h1>
          <p>Share a local issue in this demo. Your report stays in this browser and is not sent to a city or municipal team.</p>
        </section>
        <div className="demo-notice report-demo-notice" role="note">
          <span className="notice-icon" aria-hidden="true">i</span>
          <p><strong>Browser-only demo.</strong> Reports are saved on this device in this browser. They are not shared or sent anywhere.</p>
        </div>
        <ReportForm />
        <div className="inner-page-actions">
          <Link className="text-link" href="/issues">← Browse sample reports</Link>
          <span className="report-local-note">No account or location permission needed</span>
        </div>
      </main>
      <footer className="site-footer page-shell">
        <span>© CivicFix demo</span>
        <span>Browser-only sample · Not connected to city services</span>
      </footer>
    </>
  );
}
