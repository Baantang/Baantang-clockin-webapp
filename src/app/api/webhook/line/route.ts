import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  fetchLineDisplayName,
  fetchLineMessageContent,
  verifyLineSignature,
} from "@/lib/line";

interface LineEvent {
  type: string;
  timestamp: number;
  source: {
    type: "user" | "group" | "room";
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  message?: {
    id: string;
    type: string;
    text?: string;
  };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!verifyLineSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody) as { events: LineEvent[] };

  for (const event of body.events ?? []) {
    if (event.type !== "message") continue;
    if (event.source.type !== "group" && event.source.type !== "room") continue;
    if (event.message?.type !== "text" && event.message?.type !== "image") continue;

    const groupId = event.source.groupId ?? event.source.roomId;
    const userId = event.source.userId;

    const displayName = userId
      ? await fetchLineDisplayName(userId, event.source.groupId)
      : null;

    if (event.message.type === "text") {
      await prisma.lineMessage.create({
        data: {
          lineUserId: userId ?? null,
          displayName,
          groupId: groupId ?? null,
          messageType: "text",
          text: event.message.text ?? "",
          timestamp: new Date(event.timestamp),
        },
      });
    } else {
      const content = await fetchLineMessageContent(event.message.id);
      if (!content) continue;

      await prisma.lineMessage.create({
        data: {
          lineUserId: userId ?? null,
          displayName,
          groupId: groupId ?? null,
          messageType: "image",
          imageData: new Uint8Array(content.data),
          imageMimeType: content.mimeType,
          timestamp: new Date(event.timestamp),
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
