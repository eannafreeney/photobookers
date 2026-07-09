type SpotlightKind = "book" | "artist" | "publisher";

const KIND_LABEL: Record<SpotlightKind, string> = {
  book: "photobook",
  artist: "photography artist",
  publisher: "photobook publisher",
};

export async function rewriteSpotlightBlurb(params: {
  kind: SpotlightKind;
  sourceText: string;
  title: string;
}): Promise<string | null> {
  const trimmed = params.sourceText.trim();
  if (!trimmed) return null;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn(
      "OPENAI_API_KEY not set — using source text for spotlight blurb",
    );
    return trimmed;
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const subjectLabel = KIND_LABEL[params.kind];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content:
              "You are a book seller at Photobookers. Take this description from the author's website and turn it into a short blurb that i can use for this book. Write in third-person. Don't add your opionion or adjectives. Reformulate the provided catalogue text so it sounds like Photobookers is presenting the work to collectors. Keep facts accurate — do not invent details. Return only the blurb text, no quotes or labels. Just talk about the project as a third-party, dont mention Photobookers. Short - around 40 words max ",
          },
          {
            role: "user",
            content: `Rewrite this ${subjectLabel} blurb for "${params.title}":\n\n${trimmed}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(
        "rewriteSpotlightBlurb",
        response.status,
        await response.text(),
      );
      return trimmed;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const rewritten = data.choices?.[0]?.message?.content?.trim();
    return rewritten || trimmed;
  } catch (error) {
    console.error("rewriteSpotlightBlurb", error);
    return trimmed;
  }
}
