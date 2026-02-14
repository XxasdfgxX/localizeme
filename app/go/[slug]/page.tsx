import { notFound } from "next/navigation";
import { ClientLocationCapture } from "@/components/client-location-capture";
import { sql } from "@/lib/db";
import { parseStoredTopic } from "@/lib/topics";

export default async function PublicLinkPage({ params }: { params: { slug: string } }) {
  const [link] = await sql`
    SELECT slug, topic
    FROM share_links
    WHERE slug = ${params.slug}
    LIMIT 1;
  `;

  if (!link) {
    notFound();
  }

  const topic = parseStoredTopic(link.topic);

  return (
    <main className="container">
      <ClientLocationCapture slug={link.slug} topic={topic.label} />
    </main>
  );
}
