"use client";

import { FormEvent, useMemo, useState } from "react";
import { TOPICS, parseStoredTopic, type TopicKey } from "@/lib/topics";

type LinkItem = {
  id: number;
  slug: string;
  topic: string;
  created_at: string;
};

type Props = {
  initialLinks: LinkItem[];
  baseUrl: string;
};

export function DashboardClient({ initialLinks, baseUrl }: Props) {
  const [links, setLinks] = useState(initialLinks);
  const [slug, setSlug] = useState("");
  const [topic, setTopic] = useState<TopicKey>("restaurants");
  const [customTopic, setCustomTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const generatedUrl = useMemo(() => {
    if (!slug) {
      return "";
    }
    return `${baseUrl}/go/${slug}`;
  }, [baseUrl, slug]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, topic, customTopic })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to create link.");
      }

      setLinks((current) => [data.link, ...current]);
      setSlug("");
      setTopic("restaurants");
      setCustomTopic("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLinkUrl(linkSlug: string) {
    const url = `${baseUrl}/go/${linkSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(linkSlug);
      setTimeout(() => setCopiedSlug((current) => (current === linkSlug ? null : current)), 1800);
    } catch {
      setError("Unable to copy link. Please copy it manually.");
    }
  }

  return (
    <section className="dashboard-grid">
      <article className="card">
        <h2>Create Share Link</h2>
        <p>Choose a topic and create a slug to share with your client.</p>

        <form onSubmit={onSubmit} className="stack-sm">
          <label>
            Link slug
            <input
              required
              minLength={3}
              maxLength={60}
              pattern="[a-z0-9-]+"
              placeholder="ex: mario-orlando"
              value={slug}
              onChange={(event) => setSlug(event.target.value.toLowerCase())}
            />
          </label>

          <label>
            Topic
            <select value={topic} onChange={(event) => setTopic(event.target.value as TopicKey)}>
              {TOPICS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          {topic === "other" ? (
            <label>
              Custom topic
              <input
                required
                maxLength={80}
                placeholder="ex: pet stores, dentists, gyms"
                value={customTopic}
                onChange={(event) => setCustomTopic(event.target.value)}
              />
            </label>
          ) : null}

          {generatedUrl ? (
            <p className="inline-note">
              Preview URL: <code>{generatedUrl}</code>
            </p>
          ) : null}

          {error ? <p className="error-text">{error}</p> : null}

          <button disabled={submitting} className="button" type="submit">
            {submitting ? "Creating..." : "Create link"}
          </button>
        </form>
      </article>

      <article className="card">
        <h2>Your Links</h2>
        <p>Each client visit + location share is saved to Neon.</p>

        {links.length === 0 ? (
          <p>No links yet.</p>
        ) : (
          <ul className="link-list">
            {links.map((item) => (
              <li key={item.id} className="link-row">
                <div>
                  <strong>{item.slug}</strong>
                  <p className="inline-note">Topic: {parseStoredTopic(item.topic).label}</p>
                </div>
                <div className="link-actions">
                  <a className="button button-muted" href={`/dashboard/links/${item.slug}`}>
                    Open
                  </a>
                  <button className="button button-muted" type="button" onClick={() => copyLinkUrl(item.slug)}>
                    {copiedSlug === item.slug ? "Copied" : "Copy"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
