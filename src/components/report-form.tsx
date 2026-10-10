"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import {
  addIssueSupport,
  findPossibleMatches,
  hasSupportedIssue,
  issueCategories,
  IssueCategory,
  PossibleMatch,
  readSupportCounts,
  saveSubmittedIssue,
} from "@/lib/issue-storage";

const maxPhotoSize = 1024 * 1024;
const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];

type FormErrors = {
  category?: string;
  description?: string;
  photo?: string;
  location?: string;
};

type MatchOption = PossibleMatch & {
  supportCount: number;
  alreadySupported: boolean;
};

export function ReportForm() {
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState("");
  const [matchOptions, setMatchOptions] = useState<MatchOption[] | null>(null);
  const [success, setSuccess] = useState<{ kind: "submitted" | "supported"; reportId?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPhotoDataUrl("");
    setPhotoName("");
    setErrors((current) => ({ ...current, photo: undefined }));

    if (!file) {
      return;
    }

    if (!allowedPhotoTypes.includes(file.type)) {
      setErrors((current) => ({
        ...current,
        photo: "Choose a JPEG, PNG, or WebP image.",
      }));
      event.target.value = "";
      return;
    }

    if (file.size > maxPhotoSize) {
      setErrors((current) => ({
        ...current,
        photo: "This image is too large. Choose a file up to 1 MB.",
      }));
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("The image could not be previewed."));
          }
        };
        reader.onerror = () => reject(new Error("The image could not be read. Try another file."));
        reader.readAsDataURL(file);
      });
      setPhotoDataUrl(dataUrl);
      setPhotoName(file.name);
    } catch (error) {
      setErrors((current) => ({
        ...current,
        photo: error instanceof Error ? error.message : "The image could not be read. Try another file.",
      }));
      event.target.value = "";
    }
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    if (!category) {
      nextErrors.category = "Choose an issue category.";
    }
    if (!description.trim()) {
      nextErrors.description = "Add a short description of the issue.";
    } else if (description.trim().length > 1000) {
      nextErrors.description = "Keep the description to 1,000 characters or fewer.";
    }
    if (!photoDataUrl) {
      nextErrors.photo = "Choose a photo to include with this report.";
    }
    if (!location.trim()) {
      nextErrors.location = "Enter a nearby street, landmark, or area.";
    } else if (location.trim().length > 120) {
      nextErrors.location = "Keep the location to 120 characters or fewer.";
    }
    return nextErrors;
  }

  function saveReport() {
    if (!category || !photoDataUrl) {
      return;
    }
    setFormError("");
    setIsSubmitting(true);
    try {
      saveSubmittedIssue({
        category,
        description: description.trim(),
        location: location.trim(),
        photoDataUrl,
      });
      setSuccess({ kind: "submitted" });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "The report could not be saved. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(null);
    setFormError("");
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0 || !category || !photoDataUrl) {
      return;
    }

    try {
      const matches = findPossibleMatches(category, location.trim());
      const supportCounts = readSupportCounts();
      setMatchOptions(matches.map((match) => ({
        ...match,
        supportCount: supportCounts[match.id] ?? 0,
        alreadySupported: hasSupportedIssue(match.id),
      })));
    } catch (error) {
      setMatchOptions(null);
      setFormError(error instanceof Error ? error.message : "Possible matches could not be checked. Please try again.");
    }
  }

  function handleSupport(reportId: string) {
    setFormError("");
    setIsSubmitting(true);
    try {
      addIssueSupport(reportId);
      setSuccess({ kind: "supported", reportId });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Support could not be saved. Please try again.");
      if (error instanceof Error && error.message.includes("already supported")) {
        setMatchOptions((current) => current?.map((match) =>
          match.id === reportId ? { ...match, alreadySupported: true } : match,
        ) ?? null);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <section className="report-success" role="status">
        <span className="report-success-icon" aria-hidden="true">✓</span>
        <span className="eyebrow">Saved in this browser only</span>
        <h2>{success.kind === "supported" ? "You supported this demo report." : "Your demo report is saved."}</h2>
        <p>
          {success.kind === "supported"
            ? `Your support for ${success.reportId} is saved in this browser only. Nothing has been sent anywhere.`
            : "It has not been sent anywhere. You can see it in your browser’s CivicFix demo issues list."}
        </p>
        <div className="success-actions">
          <Link className="button button-primary" href="/issues">View demo reports <span aria-hidden="true">↗</span></Link>
          <button
            className="button button-secondary"
            onClick={() => {
              setCategory("");
              setDescription("");
              setLocation("");
              setPhotoDataUrl("");
              setPhotoName("");
              setSuccess(null);
              setErrors({});
              setMatchOptions(null);
            }}
            type="button"
          >
            Add another
          </button>
        </div>
      </section>
    );
  }

  return (
    <form className="report-form" onSubmit={handleSubmit} noValidate>
      <div className="report-form-heading">
        <div>
          <span className="tiny-label">DEMO REPORT</span>
          <h2>Tell us what you noticed</h2>
        </div>
        <span className="required-note">All fields required</span>
      </div>

      {formError && <p className="form-message form-error" role="alert">{formError}</p>}

      <div className="form-field">
        <label htmlFor="issue-category">Issue category <span aria-hidden="true">*</span></label>
        <select
          aria-describedby={errors.category ? "category-error" : undefined}
          aria-invalid={Boolean(errors.category)}
          id="issue-category"
          onChange={(event) => {
            const value = event.target.value;
            setCategory(issueCategories.find((option) => option === value) ?? "");
            setErrors((current) => ({ ...current, category: undefined }));
          }}
          required
          value={category}
        >
          <option value="">Choose a category</option>
          {issueCategories.map((option) => (
            <option key={option} value={option}>
              {option.replace(/\b\w/g, (letter) => letter.toUpperCase())}
            </option>
          ))}
        </select>
        {errors.category && <span className="field-error" id="category-error">{errors.category}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="issue-description">Description <span aria-hidden="true">*</span></label>
        <textarea
          aria-describedby={errors.description ? "description-error" : "description-hint"}
          aria-invalid={Boolean(errors.description)}
          id="issue-description"
          maxLength={1000}
          onChange={(event) => {
            setDescription(event.target.value);
            setErrors((current) => ({ ...current, description: undefined }));
          }}
          placeholder="What did you notice? Add a helpful detail or two."
          required
          rows={4}
          value={description}
        />
        <div className="field-foot">
          {errors.description
            ? <span className="field-error" id="description-error">{errors.description}</span>
            : <span className="field-hint" id="description-hint">Up to 1,000 characters</span>}
          <span className="character-count">{description.length}/1000</span>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="issue-photo">Photo <span aria-hidden="true">*</span></label>
        <p className="field-hint photo-hint">JPEG, PNG, or WebP · Up to 1 MB</p>
        <input
          accept="image/jpeg,image/png,image/webp"
          aria-describedby={errors.photo ? "photo-error" : "photo-hint"}
          aria-invalid={Boolean(errors.photo)}
          className="photo-input"
          id="issue-photo"
          onChange={handlePhotoChange}
          required
          type="file"
        />
        <label className="photo-picker" htmlFor="issue-photo">
          <span className="photo-picker-icon" aria-hidden="true">＋</span>
          <span><strong>{photoName || "Choose a photo"}</strong><small>{photoName ? "Choose a different image" : "Select an image from this device"}</small></span>
        </label>
        {errors.photo && <span className="field-error" id="photo-error">{errors.photo}</span>}
        {!errors.photo && <span className="field-hint photo-hint" id="photo-hint">Your photo stays in this browser with the demo report.</span>}
        {photoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="photo-preview" src={photoDataUrl} alt="Preview of the selected report photo" />
        )}
      </div>

      <div className="form-field">
        <label htmlFor="issue-location">Nearby location <span aria-hidden="true">*</span></label>
        <input
          aria-describedby={errors.location ? "location-error" : "location-hint"}
          aria-invalid={Boolean(errors.location)}
          id="issue-location"
          maxLength={120}
          onChange={(event) => {
            setLocation(event.target.value);
            setErrors((current) => ({ ...current, location: undefined }));
          }}
          placeholder="Street, landmark, or neighbourhood"
          required
          type="text"
          value={location}
        />
        <div className="field-foot">
          {errors.location
            ? <span className="field-error" id="location-error">{errors.location}</span>
            : <span className="field-hint" id="location-hint">A manual description is enough; no GPS needed.</span>}
          <span className="character-count">{location.length}/120</span>
        </div>
      </div>

      {matchOptions !== null && (
        <section className="possible-matches" aria-live="polite" aria-labelledby="possible-matches-title">
          <div className="matches-heading">
            <span className="tiny-label">BROWSER-ONLY CHECK</span>
            <h3 id="possible-matches-title">
              {matchOptions.length > 0 ? "Possible same-area issue" : "No possible same-area issue found"}
            </h3>
            <p>
              We compare the category and entered location text (ignoring case and extra spaces). We do not calculate geographic distance.
            </p>
          </div>
          {matchOptions.length > 0 ? (
            <div className="match-list">
              {matchOptions.map((match) => (
                <article className="match-card" key={match.id}>
                  <div className="match-card-copy">
                    <div className="issue-meta">
                      <span className="category-label">{match.category}</span>
                      <span className="issue-id">{match.id}</span>
                      {match.isSample && <span className="demo-tag">SAMPLE</span>}
                    </div>
                    <p>{match.description}</p>
                    <span className="match-location"><span aria-hidden="true">⌖</span>{match.location}</span>
                    <span className="match-support-count">{match.supportCount} browser support{match.supportCount === 1 ? "" : "s"}</span>
                  </div>
                  <button
                    className="button button-support"
                    disabled={isSubmitting || match.alreadySupported}
                    onClick={() => handleSupport(match.id)}
                    type="button"
                  >
                    {match.alreadySupported ? "Already supported here" : "Support this report"}
                  </button>
                </article>
              ))}
              <p className="match-separate-note">Prefer to keep yours separate? You can submit a new demo report instead.</p>
            </div>
          ) : (
            <p className="match-empty">You can still submit your report as a separate browser-only demo entry.</p>
          )}
          <button className="button button-primary submit-report" disabled={isSubmitting} onClick={saveReport} type="button">
            {isSubmitting ? "Saving demo report…" : "Continue and submit separately"}
            <span aria-hidden="true">↗</span>
          </button>
          <button className="match-back-button" onClick={() => setMatchOptions(null)} type="button">
            Edit report details
          </button>
        </section>
      )}

      {matchOptions === null && (
        <button className="button button-primary submit-report" disabled={isSubmitting} type="submit">
          Check for possible matches
          <span aria-hidden="true">⌕</span>
        </button>
      )}
      <p className="form-disclaimer">This check and any support or report are saved in this browser only. Nothing is sent to a city service.</p>
    </form>
  );
}
