import Anthropic from "@anthropic-ai/sdk";
import { formatThaiDateTime } from "@/lib/attendance";

export function anthropicEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

interface SummarizableMessage {
  displayName: string | null;
  timestamp: Date;
  messageType: string;
  text: string | null;
  imageData: Uint8Array | null;
  imageMimeType: string | null;
}

/**
 * Summarizes a batch of LINE group messages (text + photos) into a short
 * Thai-language summary for admins, using Claude's vision support for
 * images (e.g. absence papers, sick notes).
 */
export async function summarizeLineMessages(
  messages: SummarizableMessage[]
): Promise<string> {
  if (!anthropicEnabled()) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  if (messages.length === 0) {
    return "ไม่มีข้อความในช่วงเวลานี้";
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const content: Anthropic.MessageParam["content"] = [
    {
      type: "text",
      text:
        "ต่อไปนี้คือข้อความจากกลุ่ม LINE ของพนักงาน (อาจมีรูปใบลา/ใบรับรองแพทย์ปนอยู่) " +
        "ช่วยสรุปเป็นภาษาไทยแบบกระชับ แยกเป็นหัวข้อย่อยถ้ามีหลายเรื่อง " +
        "เน้นเรื่องการลา/ขาดงาน/มาสาย/เหตุการณ์สำคัญ ถ้าเป็นรูปภาพให้บอกด้วยว่าเป็นเอกสารประเภทไหนถ้าดูออก:\n",
    },
  ];

  for (const msg of messages) {
    const who = msg.displayName ?? "ไม่ทราบชื่อ";
    const when = formatThaiDateTime(msg.timestamp);
    if (msg.messageType === "text" && msg.text) {
      content.push({
        type: "text",
        text: `[${when}] ${who}: ${msg.text}`,
      });
    } else if (msg.messageType === "image" && msg.imageData && msg.imageMimeType) {
      content.push({
        type: "text",
        text: `[${when}] ${who} ส่งรูปภาพ:`,
      });
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: msg.imageMimeType as
            | "image/jpeg"
            | "image/png"
            | "image/gif"
            | "image/webp",
          data: Buffer.from(msg.imageData).toString("base64"),
        },
      });
    }
  }

  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text ?? "ไม่สามารถสรุปข้อความได้";
}
