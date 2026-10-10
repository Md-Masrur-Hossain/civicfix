"use client";

import { useEffect, useState } from "react";
import {
  IssueStatus,
  issueStatuses,
  readReviewReports,
  readSupportCounts,
  ReviewReport,
  saveIssueStatus,
} from "@/lib/issue-storage";

export function AdminReview() {
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [supportCounts, setSupportCounts] = useState<Record<string, number>>({});
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, IssueStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) {
        return;
      }
      try {
        const currentReports = readReviewReports();
        setReports(currentReports);
        setSelectedStatuses(Object.fromEntries(
          currentReports.map((report) => [report.id, report.status]),
        ));
        setSupportCounts(readSupportCounts());
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Demo reports could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function handleSave(report: ReviewReport) {
    const selectedStatus = selectedStatuses[report.id];
    if (!selectedStatus || selectedStatus === report.status) {
      return;
    }

    setIsSaving(report.id);
    setError("");
    setSuccess("");
    try {
      saveIssueStatus(report.id, selectedStatus);
      setReports((current) => current.map((item) =>
        item.id === report.id ? { ...item, status: selectedStatus } : item,
      ));
      setSuccess(`Demo status for ${report.id} saved as ${selectedStatus}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The demo status could not be saved.");
    } finally {
      setIsSaving(null);
    }
  }

  return (
    <section className="admin-review-section" aria-labelledby="review-reports-title">
      <div className="admin-review-heading">
        <div>
          <span className="tiny-label">LOCAL DEMO REPORTS</span>
          <h2 id="review-reports-title">Review neighbourhood reports</h2>
          <p>Changes are saved only in this browser. They are not shared with another browser or a real city team.</p>
        </div>
        {!isLoading && <span className="review-count">{reports.length} report{reports.length === 1 ? "" : "s"}</span>}
      </div>

      {error && (
        <div className="form-message form-error review-message" role="alert">
          <span>{error}</span>
          <button
            onClick={() => {
              setIsLoading(true);
              setReloadKey((key) => key + 1);
            }}
            type="button"
          >
            Try again
          </button>
        </div>
      )}
      {success && <p className="review-success" role="status">{success}</p>}

      {isLoading ? (
        <div className="loading-state" role="status">
          <span className="loading-spinner" aria-hidden="true" />
          Loading browser demo reports…
        </div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">✳</span>
          <h3>No reports to review</h3>
          <p>Browser-saved reports will appear here when available.</p>
        </div>
      ) : (
        <div className="review-list">
          {reports.map((report) => {
            const selectedStatus = selectedStatuses[report.id] ?? report.status;
            const hasChanges = selectedStatus !== report.status;
            return (
              <article className="review-card" key={report.id}>
                <div className="review-card-heading">
                  <div className="issue-meta">
                    <span className="category-label">
                      {report.category.replace(/\b\w/g, (letter) => letter.toUpperCase())}
                    </span>
                    <span className="issue-id">{report.id}</span>
                    <span className="demo-tag">{report.isSample ? "SAMPLE" : "BROWSER DEMO"}</span>
                  </div>
                  <span className={`status-pill status-${report.status.toLowerCase().replace(" ", "-")}`}>
                    <i />{report.status}
                  </span>
                </div>
                <p className="review-description">{report.description}</p>
                <div className="review-card-footer">
                  <span className="review-location"><span aria-hidden="true">⌖</span>{report.location}</span>
                  <span className="review-support-count">
                    <span aria-hidden="true">♡</span>{supportCounts[report.id] ?? 0} browser support{supportCounts[report.id] === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="review-status-control">
                  <label htmlFor={`status-${report.id}`}>Update demo status</label>
                  <select
                    id={`status-${report.id}`}
                    onChange={(event) => {
                      const value = event.target.value;
                      const validStatus = issueStatuses.find((status) => status === value);
                      if (validStatus) {
                        setSelectedStatuses((current) => ({ ...current, [report.id]: validStatus }));
                      }
                    }}
                    value={selectedStatus}
                  >
                    {issueStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <button
                    className="button button-primary review-save-button"
                    disabled={!hasChanges || isSaving === report.id}
                    onClick={() => handleSave(report)}
                    type="button"
                  >
                    {isSaving === report.id ? "Saving…" : "Save status"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
