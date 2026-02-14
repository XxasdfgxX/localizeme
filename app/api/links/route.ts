import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { getAuthSession } from "@/lib/session";
import { encodeStoredTopic, isTopicKey } from "@/lib/topics";

const createLinkSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  topic: z.string(),
  customTopic: z.string().max(80).optional()
});

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createLinkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const { slug, topic, customTopic } = parsed.data;
  if (!isTopicKey(topic)) {
    return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
  }

  let storedTopic: string;
  try {
    storedTopic = encodeStoredTopic(topic, customTopic);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid custom topic" }, { status: 400 });
  }

  try {
    const inserted = await sql`
      INSERT INTO share_links (slug, topic, owner_email)
      VALUES (${slug}, ${storedTopic}, ${session.user.email})
      RETURNING id, slug, topic, owner_email, created_at;
    `;
    return NextResponse.json({ link: inserted[0] }, { status: 201 });
  } catch (error) {
    if (String(error).toLowerCase().includes("unique")) {
      return NextResponse.json({ error: "Slug already exists. Try another one." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create link" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await sql`
    SELECT id, slug, topic, owner_email, created_at
    FROM share_links
    WHERE owner_email = ${session.user.email}
    ORDER BY created_at DESC;
  `;
  return NextResponse.json({ links });
}
