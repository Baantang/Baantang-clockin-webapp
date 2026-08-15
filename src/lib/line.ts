import crypto from "crypto";

export function verifyLineSignature(rawBody: string, signature: string | null) {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret || !signature) return false;

  const hash = crypto
    .createHmac("sha256", channelSecret)
    .update(rawBody)
    .digest("base64");

  return hash === signature;
}

export async function fetchLineDisplayName(
  userId: string,
  groupId?: string
): Promise<string | null> {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!accessToken) return null;

  const url = groupId
    ? `https://api.line.me/v2/bot/group/${groupId}/member/${userId}`
    : `https://api.line.me/v2/bot/profile/${userId}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.displayName ?? null;
  } catch {
    return null;
  }
}

export async function fetchLineMessageContent(
  messageId: string
): Promise<{ data: Buffer; mimeType: string } | null> {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!accessToken) return null;

  try {
    const res = await fetch(
      `https://api-data.line.me/v2/bot/message/${messageId}/content`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return null;

    const mimeType = res.headers.get("content-type") ?? "application/octet-stream";
    const data = Buffer.from(await res.arrayBuffer());
    return { data, mimeType };
  } catch {
    return null;
  }
}
