import Link from "next/link";
import { AuthButtons } from "@/components/auth-buttons";

export default function HomePage() {
  return (
    <main className="container">
      <section className="hero">
        <h1>Localize turns client location shares into actionable records.</h1>
        <p>
          Your team logs in with Google, creates topic-based links, and sends them to clients. When a client opens the
          link and shares location, Localize stores each location event in Neon Postgres for follow-up.
        </p>

        <div className="hero-grid">
          <article className="badge">
            <strong>1. Google Login</strong>
            <p className="inline-note">Secure access for your internal users.</p>
          </article>
          <article className="badge">
            <strong>2. Topic Links</strong>
            <p className="inline-note">Create client links by niche and campaign.</p>
          </article>
          <article className="badge">
            <strong>3. Geo Capture</strong>
            <p className="inline-note">Collect coordinates and save every event in your database.</p>
          </article>
        </div>

        <AuthButtons />

        <p className="inline-note">
          Want to test a live client flow now? Log in and open your link from <Link href="/dashboard">Dashboard</Link>.
        </p>
      </section>
    </main>
  );
}
