import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getAuthSession } from "@/lib/session";
import { parseStoredTopic } from "@/lib/topics";
import type { LocationEvent, ShareLink } from "@/types";

export default async function DashboardLinkDetailsPage({ params }: { params: { slug: string } }) {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    redirect("/");
  }

  const [link] = (await sql`
    SELECT id, slug, topic, owner_email, created_at
    FROM share_links
    WHERE slug = ${params.slug} AND owner_email = ${session.user.email}
    LIMIT 1;
  `) as ShareLink[];

  if (!link) {
    notFound();
  }

  const events = (await sql`
    SELECT id, latitude, longitude, accuracy_meters, client_ip, user_agent, created_at
    FROM location_events
    WHERE link_id = ${link.id}
    ORDER BY created_at DESC;
  `) as LocationEvent[];

  const parsedTopic = parseStoredTopic(link.topic);

  return (
    <main className="container">
      <header className="page-head">
        <div>
          <h1>Link Details: {link.slug}</h1>
          <p className="inline-note">Topic: {parsedTopic.label}</p>
        </div>
        <Link href="/dashboard" className="button button-muted">
          Back to Dashboard
        </Link>
      </header>

      <article className="card">
        <h2>Location Shares</h2>
        <p className="inline-note">Total events: {events.length}</p>

        {events.length === 0 ? (
          <p className="inline-note">No locations captured yet for this link.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Accuracy (m)</th>
                  <th>Client IP</th>
                  <th>User Agent</th>
                  <th>Map</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{new Date(event.created_at).toLocaleString()}</td>
                    <td>{event.latitude.toFixed(6)}</td>
                    <td>{event.longitude.toFixed(6)}</td>
                    <td>{event.accuracy_meters === null ? "-" : Math.round(event.accuracy_meters)}</td>
                    <td>{event.client_ip ?? "-"}</td>
                    <td>{event.user_agent ?? "-"}</td>
                    <td>
                      <a
                        className="button button-muted button-xs"
                        href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open location
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </main>
  );
}
