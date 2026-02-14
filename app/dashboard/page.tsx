import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import { getAuthSession } from "@/lib/session";
import { sql } from "@/lib/db";
import type { ShareLink } from "@/types";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    redirect("/");
  }

  const links = (await sql`
    SELECT id, slug, topic, owner_email, created_at
    FROM share_links
    WHERE owner_email = ${session.user.email}
    ORDER BY created_at DESC;
  `) as ShareLink[];

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return (
    <main className="container">
      <header className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="inline-note">Signed in as {session.user.email}</p>
        </div>
        <Link href="/" className="button button-muted">
          Homepage
        </Link>
      </header>

      <DashboardClient initialLinks={links} baseUrl={baseUrl} />
    </main>
  );
}
