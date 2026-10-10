export const issueCategories = [
  "pothole",
  "garbage",
  "broken streetlight",
  "water leak",
  "other",
] as const;

export type IssueCategory = (typeof issueCategories)[number];
export const issueStatuses = ["New", "In progress", "Resolved"] as const;
export type IssueStatus = (typeof issueStatuses)[number];

export type SubmittedIssue = {
  id: string;
  category: IssueCategory;
  description: string;
  location: string;
  photoDataUrl: string;
  createdAt: string;
};

export type PossibleMatch = {
  id: string;
  category: IssueCategory;
  description: string;
  location: string;
  status: IssueStatus;
  isSample: boolean;
};

export type ReviewReport = {
  id: string;
  category: IssueCategory;
  description: string;
  location: string;
  status: IssueStatus;
  isSample: boolean;
};

type SupportRecord = {
  reportId: string;
  createdAt: string;
};

const storageKey = "civicfix-demo-reports";
const supportStorageKey = "civicfix-demo-supports";
const statusStorageKey = "civicfix-demo-statuses";

const sampleIssues: Array<ReviewReport & { status: IssueStatus }> = [
  {
    id: "CF-024",
    category: "pothole",
    description: "A rough patch on the road just before the north gate. Easy to miss after dark.",
    location: "Maple Street · North Park",
    status: "In progress",
    isSample: true,
  },
  {
    id: "CF-023",
    category: "broken streetlight",
    description: "The light outside the corner shop has been off for a few evenings.",
    location: "Cedar Lane · Block 4",
    status: "New",
    isSample: true,
  },
  {
    id: "CF-021",
    category: "garbage",
    description: "The public bin is full and some litter has blown onto the pavement.",
    location: "Oak Avenue · Bus stop",
    status: "Resolved",
    isSample: true,
  },
];

function isIssueCategory(value: unknown): value is IssueCategory {
  return issueCategories.some((category) => category === value);
}

function isSubmittedIssue(value: unknown): value is SubmittedIssue {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const issue = value as Record<string, unknown>;
  return (
    typeof issue.id === "string" &&
    isIssueCategory(issue.category) &&
    typeof issue.description === "string" &&
    typeof issue.location === "string" &&
    typeof issue.photoDataUrl === "string" &&
    typeof issue.createdAt === "string"
  );
}

function isSupportRecord(value: unknown): value is SupportRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.reportId === "string" && typeof record.createdAt === "string";
}

function isIssueStatus(value: unknown): value is IssueStatus {
  return issueStatuses.some((status) => status === value);
}

function readStatusOverrides(): Record<string, IssueStatus> {
  try {
    const stored = window.localStorage.getItem(statusStorageKey);
    if (stored === null) {
      return {};
    }

    const parsed: unknown = JSON.parse(stored);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed) ||
      !Object.entries(parsed).every(([id, status]) => id.length > 0 && isIssueStatus(status))
    ) {
      throw new Error("Saved report statuses have an unexpected format.");
    }
    return parsed as Record<string, IssueStatus>;
  } catch (error) {
    if (
      error instanceof SyntaxError ||
      (error instanceof Error && error.message === "Saved report statuses have an unexpected format.")
    ) {
      throw new Error("Saved demo statuses could not be read. Clear this site's browser storage to start again.");
    }
    throw new Error("Browser storage is unavailable. Check your browser settings and try again.");
  }
}

function readSupportRecords(): SupportRecord[] {
  try {
    const stored = window.localStorage.getItem(supportStorageKey);
    if (stored === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every(isSupportRecord)) {
      throw new Error("Saved support records have an unexpected format.");
    }
    return parsed;
  } catch (error) {
    if (
      error instanceof SyntaxError ||
      (error instanceof Error && error.message === "Saved support records have an unexpected format.")
    ) {
      throw new Error("Saved demo supports could not be read. Clear this site's browser storage to start again.");
    }
    throw new Error("Browser storage is unavailable. Check your browser settings and try again.");
  }
}

export function normalizeLocationText(location: string): string {
  return location.trim().replace(/\s+/g, " ").toLowerCase();
}

export function readSubmittedIssues(): SubmittedIssue[] {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every(isSubmittedIssue)) {
      throw new Error("Saved reports have an unexpected format.");
    }
    return parsed;
  } catch (error) {
    if (
      error instanceof SyntaxError ||
      (error instanceof Error && error.message === "Saved reports have an unexpected format.")
    ) {
      throw new Error("Saved demo reports could not be read. Clear this site's browser storage to start again.");
    }
    throw new Error("Browser storage is unavailable. Check your browser settings and try again.");
  }
}

export function findPossibleMatches(
  category: IssueCategory,
  location: string,
): PossibleMatch[] {
  const normalizedLocation = normalizeLocationText(location);
  return readReviewReports().filter(
    (issue) =>
      issue.category === category &&
      issue.status !== "Resolved" &&
      normalizeLocationText(issue.location) === normalizedLocation,
  );
}

export function readReviewReports(): ReviewReport[] {
  const statusOverrides = readStatusOverrides();
  const savedReports: ReviewReport[] = readSubmittedIssues().map((issue) => ({
    id: issue.id,
    category: issue.category,
    description: issue.description,
    location: issue.location,
    status: statusOverrides[issue.id] ?? "New",
    isSample: false,
  }));

  return [...sampleIssues, ...savedReports].map((issue) => ({
    ...issue,
    status: statusOverrides[issue.id] ?? issue.status,
  }));
}

export function saveIssueStatus(reportId: string, status: IssueStatus): void {
  if (!isIssueStatus(status)) {
    throw new Error("Choose a valid report status.");
  }

  const reports = readReviewReports();
  if (!reports.some((report) => report.id === reportId)) {
    throw new Error("This report could not be found in browser demo data.");
  }

  const overrides = readStatusOverrides();
  try {
    window.localStorage.setItem(statusStorageKey, JSON.stringify({ ...overrides, [reportId]: status }));
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      throw new Error("This browser is out of space for demo status updates. Remove some site data and try again.");
    }
    throw new Error("The status could not be saved in this browser. Check browser storage and try again.");
  }
}

export function readSupportCounts(): Record<string, number> {
  return readSupportRecords().reduce<Record<string, number>>((counts, record) => {
    counts[record.reportId] = (counts[record.reportId] ?? 0) + 1;
    return counts;
  }, {});
}

export function hasSupportedIssue(reportId: string): boolean {
  return readSupportRecords().some((record) => record.reportId === reportId);
}

export function addIssueSupport(reportId: string): number {
  const issue = readReviewReports().find((candidate) => candidate.id === reportId);

  if (!issue || issue.status === "Resolved") {
    throw new Error("This report is no longer open for support.");
  }

  const supportRecords = readSupportRecords();
  if (supportRecords.some((record) => record.reportId === reportId)) {
    throw new Error("This browser has already supported that report.");
  }

  const nextRecords = [...supportRecords, { reportId, createdAt: new Date().toISOString() }];
  try {
    window.localStorage.setItem(supportStorageKey, JSON.stringify(nextRecords));
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      throw new Error("This browser is out of space for demo supports. Remove some site data and try again.");
    }
    throw new Error("Support could not be saved in this browser. Check browser storage and try again.");
  }

  return nextRecords.filter((record) => record.reportId === reportId).length;
}

export function saveSubmittedIssue(
  issue: Omit<SubmittedIssue, "id" | "createdAt">,
): SubmittedIssue {
  const submittedIssue: SubmittedIssue = {
    ...issue,
    id: `CF-${window.crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };

  try {
    const reports = readSubmittedIssues();
    window.localStorage.setItem(storageKey, JSON.stringify([submittedIssue, ...reports]));
    return submittedIssue;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Saved demo reports")) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      throw new Error("This browser is out of space for demo reports. Remove some site data and try again.");
    }
    throw new Error("This report could not be saved in this browser. Check browser storage and try again.");
  }
}
