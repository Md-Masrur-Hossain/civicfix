import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

type Issue = {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  date: string;
  status: "New" | "In progress" | "Resolved";
  icon: string;
  tone: string;
};

const issues: Issue[] = [
  {
    id: "CF-024",
    category: "Roads & pavements",
    title: "Pothole near the park entrance",
    description: "A rough patch on the road just before the north gate. Easy to miss after dark.",
    location: "Maple Street · North Park",
    date: "Added 2 days ago",
    status: "In progress",
    icon: "↗",
    tone: "peach",
  },
  {
    id: "CF-023",
    category: "Street lighting",
    title: "Streetlight out on Cedar Lane",
    description: "The light outside the corner shop has been off for a few evenings.",
    location: "Cedar Lane · Block 4",
    date: "Added 4 days ago",
    status: "New",
    icon: "✳",
    tone: "yellow",
  },
  {
    id: "CF-021",
    category: "Waste & recycling",
    title: "Overflowing bin by the bus stop",
    description: "The public bin is full and some litter has blown onto the pavement.",
    location: "Oak Avenue · Bus stop",
    date: "Added 1 week ago",
    status: "Resolved",
    icon: "⌂",
    tone: "mint",
  },
];

function statusClass(status: Issue["status"]) {
  return `status-pill status-${status.toLowerCase().replace(" ", "-")}`;
}

export default function IssuesPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell inner-page">
        <div className="page-kicker">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><span>Explore reports</span>
        </div>
        <section className="issues-heading">
          <div>
            <span className="eyebrow"><span className="eyebrow-dot" />Neighbourhood board</span>
            <h1>Little things,<br /><span>worth noticing.</span></h1>
            <p>See a few examples of the kinds of issues neighbours might keep track of together.</p>
          </div>
          <div className="demo-stamp">
            <span className="demo-stamp-icon" aria-hidden="true">✳</span>
            <span><strong>DEMO DATA</strong><small>Sample reports only</small></span>
          </div>
        </section>

        <div className="demo-notice" role="note">
          <span className="notice-icon" aria-hidden="true">i</span>
          <p><strong>These are made-up sample reports.</strong> Nothing on this page has been submitted to a city service.</p>
        </div>

        <section className="issue-list-section" aria-labelledby="issue-list-title">
          <div className="list-toolbar">
            <div>
              <h2 id="issue-list-title">Around the neighbourhood</h2>
              <span>{issues.length} sample reports <span className="list-dot">·</span> All categories</span>
            </div>
            <span className="sort-note"><span aria-hidden="true">☷</span> Newest first</span>
          </div>

          {issues.length > 0 ? (
            <div className="issue-list">
              {issues.map((issue) => (
                <article className="issue-card" key={issue.id}>
                  <div className={`issue-icon ${issue.tone}`} aria-hidden="true">{issue.icon}</div>
                  <div className="issue-main">
                    <div className="issue-meta">
                      <span className="category-label">{issue.category}</span>
                      <span className="issue-id">{issue.id}</span>
                    </div>
                    <h3>{issue.title}</h3>
                    <p className="issue-description">{issue.description}</p>
                    <div className="issue-footer">
                      <span><span aria-hidden="true">⌖</span>{issue.location}</span>
                      <span>{issue.date}</span>
                    </div>
                  </div>
                  <div className="issue-status">
                    <span className={statusClass(issue.status)}><i />{issue.status}</span>
                    <span className="demo-tag">DEMO</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span aria-hidden="true">✳</span>
              <h3>No reports to show yet</h3>
              <p>When reports are available, they’ll appear here.</p>
            </div>
          )}
        </section>

        <section className="issues-bottom-note">
          <span className="note-spark" aria-hidden="true">✳</span>
          <p>In a future version, residents could support a nearby issue or submit a separate report.</p>
        </section>
        <div className="inner-page-actions">
          <Link className="text-link" href="/">← Back to home</Link>
          <Link className="button button-primary" href="/admin">Admin preview <span aria-hidden="true">↗</span></Link>
        </div>
      </main>
      <footer className="site-footer page-shell">
        <span>© CivicFix demo</span>
        <span>Sample content only · Not connected to city services</span>
      </footer>
    </>
  );
}
