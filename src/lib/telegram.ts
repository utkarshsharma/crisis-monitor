import { NextRequest } from "next/server";

/**
 * Verify that a request comes from Vercel Cron (or an authorized caller).
 * Vercel injects `Authorization: Bearer <CRON_SECRET>` on every cron invocation.
 */
export function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

/**
 * Split a message into chunks that fit within Telegram's 4096-char limit.
 * Splits on newline boundaries to avoid cutting mid-line.
 */
function splitMessage(text: string, maxLen = 4000): string[] {
  if (text.length <= maxLen) return [text];

  const lines = text.split("\n");
  const chunks: string[] = [];
  let current = "";

  for (const line of lines) {
    if (current && (current + "\n" + line).length > maxLen) {
      chunks.push(current.trim());
      current = line;
    } else {
      current = current ? current + "\n" + line : line;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks;
}

/**
 * Escape HTML special characters for Telegram HTML parse mode.
 */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Send a message to the configured Telegram bot/channel.
 * Uses HTML parse mode (more robust than Markdown with user-provided text).
 * Automatically splits long messages into multiple sends.
 */
export async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured");
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const chunks = splitMessage(text);

  for (const chunk of chunks) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: chunk,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Telegram API error ${res.status}: ${body}`);
    }
  }
}

/**
 * Format a titled section for Telegram messages (HTML mode).
 */
export function formatTextBlock(title: string, items: string[]): string {
  if (items.length === 0) return "";
  return `\n📌 <b>${escapeHtml(title)}</b>\n${items.join("\n")}\n`;
}
