import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  situation: z.string().min(1).max(4000),
  style: z.string().min(1).max(40),
  tweak: z.enum(["none", "shorter", "friendlier", "another"]).default("none"),
  previous: z.string().max(4000).optional(),
});

function mock(situation: string, style: string) {
  return `Hi,\n\nI wanted to let you know: ${situation.trim().replace(/\s+/g, " ")}\n\nThanks so much for understanding.\n\n(Demo ${style.toLowerCase()} draft — AI is not configured yet.)`;
}

export const writeMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { message: mock(data.situation, data.style), mocked: true };

    const tweakLine =
      data.tweak === "shorter"
        ? "Rewrite the previous draft to be noticeably shorter while keeping all key information."
        : data.tweak === "friendlier"
          ? "Rewrite the previous draft to sound warmer and friendlier, without becoming unprofessional."
          : data.tweak === "another"
            ? "Write a clearly different alternative version of the previous draft, same meaning and facts."
            : "";

    const system = [
      "You help ordinary people phrase awkward messages.",
      "Return ONLY the final message text — no preamble, no options, no quotes, no explanations.",
      "Preserve the user's intended meaning exactly. Never invent facts, names, dates, reasons, or commitments the user did not provide.",
      "If a detail like a recipient name is unknown, use a neutral greeting instead of inventing one.",
      `Desired tone/style: ${data.style}.`,
      "Keep it natural, human, and ready to send.",
    ].join(" ");

    const userParts = [`Situation: ${data.situation}`];
    if (data.previous && tweakLine) {
      userParts.push(`Previous draft:\n${data.previous}`);
      userParts.push(tweakLine);
    }

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: userParts.join("\n\n") },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        if (res.status === 429) throw new Error("Too many requests right now — please try again in a moment.");
        if (res.status === 402) throw new Error("AI credits are exhausted. Add credits to keep generating.");
        throw new Error(`AI request failed (${res.status}): ${body.slice(0, 200)}`);
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("The AI returned an empty message. Please try again.");
      return { message: text, mocked: false };
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Something went wrong generating your message.");
    }
  });
