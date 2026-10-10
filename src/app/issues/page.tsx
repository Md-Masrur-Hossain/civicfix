"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import {
  IssueStatus,
  readReviewReports,
  readSubmittedIssues,
  readSupportCounts,
  SubmittedIssue,
} from "@/lib/issue-storage";

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
  photoDataUrl?: string;
  isDemo: boolean;
  sortDate: number;
};

const sampleIssues: Issue[] = [
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
    isDemo: true,
    sortDate: 3,
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
    isDemo: true,
    sortDate: 4,
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
    isDemo: true,
    sortDate: 7,
  },
];

function categoryLabel(category: SubmittedIssue["category"]) {
  return category.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function submittedIssueToIssue(issue: SubmittedIssue): Issue {
  const createdAt = new Date(issue.createdAt);
  return {
    id: issue.id,
    category: categoryLabel(issue.category),
    title: `${categoryLabel(issue.category)} report`,
    description: issue.description,
    location: issue.location,
    date: `Added ${createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
    status: "New",
    icon: "✳",
    tone: "mint",
    photoDataUrl: issue.photoDataUrl,
    isDemo: false,
    sortDate: createdAt.getTime(),
  };
}

function statusClass(status: Issue["status"]) {
  return `status-pill status-${status.toLowerCase().replace(" ", "-")}`;
}

export default function IssuesPage() {
  const [submittedIssues, setSubmittedIssues] = useState<SubmittedIssue[]>([]);
  const [supportCounts, setSupportCounts] = useState<Record<string, number>>({});
  const [reportStatuses, setReportStatuses] = useState<Record<string, IssueStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) {
        return;
      }
      try {
        setSubmittedIssues(readSubmittedIssues());
        setReportStatuses(Object.fromEntries(
          readReviewReports().map((report) => [report.id, report.status]),
        ));
        setSupportCounts(readSupportCounts());
        setStorageError("");
      } catch (error) {
        setStorageError(error instanceof Error ? error.message : "Saved reports could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const allIssues = [
    ...submittedIssues.map(submittedIssueToIssue),
    ...sampleIssues,
  ].map((issue) => ({
    ...issue,
    status: reportStatuses[issue.id] ?? issue.status,
  })).sort((first, second) => second.sortDate - first.sortDate);
  const demoCount = allIssues.filter((issue) => issue.isDemo).length;
  const savedCount = allIssues.length - demoCount;

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
          <p><strong>Browser-only demo.</strong> Sample reports are made up; your reports stay in this browser and are not sent to a city service.</p>
        </div>

        <section className="issue-list-section" aria-labelledby="issue-list-title">
          <div className="list-toolbar">
            <div>
              <h2 id="issue-list-title">Around the neighbourhood</h2>
              <span>
                {isLoading ? "Loading demo reports…" : `${allIssues.length} reports`}
                {!isLoading && <> <span className="list-dot">·</span> {demoCount} samples, {savedCount} saved here</>}
              </span>
            </div>
            <Link className="button button-primary issues-report-link" href="/report">Report an issue <span aria-hidden="true">+</span></Link>
          </div>

          {storageError && (
            <div className="form-message form-error storage-error" role="alert">
              <span>{storageError}</span>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setReloadKey((key) => key + 1);
                }}
              >
                Try again
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="loading-state" role="status">
              <span className="loading-spinner" aria-hidden="true" />
              Loading reports saved in this browser…
            </div>
          ) : allIssues.length > 0 ? (
            <div className="issue-list">
              {allIssues.map((issue) => (
                <article className="issue-card" key={issue.id}>
                  {issue.photoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="issue-photo" src={issue.photoDataUrl} alt="Photo attached to this demo report" />
                  ) : (
                    <div className={`issue-icon ${issue.tone}`} aria-hidden="true">{issue.icon}</div>
                  )}
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
                      <span className="issue-support-count" aria-label={`${supportCounts[issue.id] ?? 0} browser-only supports`}>
                        <span aria-hidden="true">♡</span>{supportCounts[issue.id] ?? 0} support{supportCounts[issue.id] === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  <div className="issue-status">
                    <span className={statusClass(issue.status)}><i />{issue.status}</span>
                    <span className="demo-tag">{issue.isDemo ? "SAMPLE" : "BROWSER DEMO"}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span aria-hidden="true">✳</span>
              <h3>No reports to show yet</h3>
              <p>When demo reports are available, they’ll appear here.</p>
              <Link className="button button-primary" href="/report">Create a demo report <span aria-hidden="true">↗</span></Link>
            </div>
          )}
        </section>

        <section className="issues-bottom-note">
          <span className="note-spark" aria-hidden="true">✳</span>
          <p>Demo reports are private to this browser and are not sent to a municipality or city team.</p>
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
