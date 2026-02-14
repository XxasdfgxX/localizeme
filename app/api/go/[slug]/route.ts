import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { parseStoredTopic } from "@/lib/topics";

const submitLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().nonnegative().optional()
});

export async function POST(request: Request, context: { params: { slug: string } }) {
  const { slug } = context.params;
  const body = await request.json();
  const parsed = submitLocationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const [link] = await sql`
    SELECT id, slug, topic
    FROM share_links
    WHERE slug = ${slug}
    LIMIT 1;
  `;
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  const headerStore = headers();
  const userAgent = headerStore.get("user-agent") ?? "unknown";
  const forwardedFor = headerStore.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim() ?? "unknown";

  const { latitude, longitude, accuracyMeters } = parsed.data;
  await sql`
    INSERT INTO location_events (link_id, latitude, longitude, accuracy_meters, client_ip, user_agent)
    VALUES (${link.id}, ${latitude}, ${longitude}, ${accuracyMeters ?? null}, ${clientIp}, ${userAgent});
  `;

  const parsedTopic = parseStoredTopic(link.topic);
  const mapsQuery = `${parsedTopic.mapsQuery} near ${latitude},${longitude}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

  return NextResponse.json({
    topic: link.topic,
    topicLabel: parsedTopic.label,
    mapsUrl,
    success: true
  });
}
