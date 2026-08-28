import sharp from "sharp";

export type CoverQuality = { ok: true } | { ok: false; reason: string };

/** Live BookCard is square + object-cover, centered. */
const CARD_WIDTH = 512;
const CARD_HEIGHT = 512;

const SYSTEM_PROMPT = `You are looking at a photobook as it appears in a square catalogue card.

Ask only: is the entire book (or entire front-cover file) visible inside this image?

PASS if:
- The full book is visible as a complete rectangle
- Table or wall showing around the book is fine
- Printed artwork that goes to the edge of the physical cover is normal, not a fail
- A flat digital cover that fills the frame edge-to-edge is a failure

FAIL only if the IMAGE FRAME cuts through the book itself: a missing corner, or the top, bottom, left, or right of the book is outside the picture. Cropped background is not a fail.

Reply JSON only: {"ok": true} or {"ok": false, "reason": "one short sentence about the book being clipped by the frame"}`;

export function parseCoverQuality(raw: string): CoverQuality {
  try {
    const parsed = JSON.parse(raw) as { ok?: unknown; reason?: unknown };
    if (parsed.ok === true) return { ok: true };
    if (
      parsed.ok === false &&
      typeof parsed.reason === "string" &&
      parsed.reason.trim()
    ) {
      return { ok: false, reason: parsed.reason.trim() };
    }
  } catch {
    // fall through
  }
  return { ok: true };
}

/** Same crop the card applies: object-cover, centered. */
export async function cardCropPreview(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .resize(CARD_WIDTH, CARD_HEIGHT, { fit: "cover", position: "centre" })
    .jpeg({ quality: 70 })
    .toBuffer();
}

export async function assessBookCover(input: Buffer): Promise<CoverQuality> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { ok: true };

  const preview = await cardCropPreview(input);
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Does this book cover fit the preview card?",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${preview.toString("base64")}`,
                },
              },
            ],
          },
        ],
      }),
    });
    if (!response.ok) return { ok: true };
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return parseCoverQuality(data.choices?.[0]?.message?.content ?? "");
  } catch {
    return { ok: true };
  }
}
