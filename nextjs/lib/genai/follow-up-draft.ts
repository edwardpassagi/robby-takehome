import "server-only";

import { GoogleGenAI } from "@google/genai";
import type { FollowUpReason } from "@/lib/quotes/follow-up-policy";

const MODEL = "gemini-3.6-flash";

const GUIDANCE: Record<FollowUpReason["code"], string> = {
  viewed_no_response:
    "They looked at the quote recently and have not replied. Ask if they had a chance to review it.",
  large_quote_quiet:
    "It has been a few days since the shop last heard from them. A simple check-in is enough.",
  repeat_follow_up:
    "The shop reached out before and it has been a while. A light nudge is enough.",
};

export async function draftFollowUpSms({
  customerName,
  techName,
  amount,
  reasonCodes,
}: {
  customerName: string;
  techName: string;
  amount: number;
  reasonCodes: FollowUpReason["code"][];
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

  const firstName = customerName.split(" ")[0] || customerName;
  const guidance = (
    reasonCodes.length > 0 ? reasonCodes : (["large_quote_quiet"] as const)
  )
    .map((code) => `- ${GUIDANCE[code]}`)
    .join("\n");

  const ai = new GoogleGenAI({ apiKey });
  let interaction;
  try {
    interaction = await ai.interactions.create({
      model: MODEL,
      input: `Write one SMS from ${techName} at Phoenix Services to ${firstName}.

Use these notes only to choose the tone. Do not mention them, and do not mention internal rules, dollar cutoffs, quote size, scores, or how many times anyone has followed up:
${guidance}

Their quote total is $${amount.toLocaleString("en-US")}. You may mention that amount as their quote.

Two short sentences at most. Warm and plain. No hashtags, no subject line, and no quotation marks around the text.`,
    });
  } catch (error) {
    throw new Error(geminiErrorMessage(error));
  }

  const text =
    "output_text" in interaction ? interaction.output_text?.trim() : "";
  if (!text) throw new Error("Gemini did not return a draft.");
  return text.replace(/^["']|["']$/g, "").trim();
}

function geminiErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const body =
    error && typeof error === "object" && "body" in error
      ? String(error.body)
      : "";
  const detail = `${message}\n${body}`;
  if (
    detail.includes("API_KEY_INVALID") ||
    detail.includes("API key not valid")
  ) {
    return "Gemini rejected the API key in .env.local.";
  }
  return "The draft could not be generated.";
}
