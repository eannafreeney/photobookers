import { client } from "@/db/client";

export type CandidateBook = {
  id: string;
  slug: string;
  title: string;
  description: string;
  artist: string | null;
  artistStatus: string | null;
  tags: string[];
  score: number;
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Retrieve real, published candidate books whose title, description or tags
 * match any of the theme facets. Grounds generation in the actual catalogue —
 * the model only ever selects from what this returns, never invents books.
 */
export async function retrieveCandidates(
  facets: string[],
  limit = 40,
): Promise<CandidateBook[]> {
  const cleaned = [
    ...new Set(facets.map((f) => f.trim().toLowerCase()).filter(Boolean)),
  ];
  if (cleaned.length === 0) return [];

  const rx = cleaned.map(escapeRegex).join("|");

  const rows = await client<CandidateBook[]>`
    SELECT
      b.id,
      b.slug,
      b.title,
      left(coalesce(b.description, ''), 400) AS description,
      c.display_name AS artist,
      c.status AS "artistStatus",
      coalesce(b.tags, '{}') AS tags,
      (
        (b.title ~* ${rx})::int
        + (coalesce(b.description, '') ~* ${rx})::int
        + (EXISTS (
            SELECT 1 FROM unnest(coalesce(b.tags, '{}')) t WHERE t ~* ${rx}
          ))::int
      ) AS score
    FROM books b
    LEFT JOIN creators c ON c.id = b.artist_id
    WHERE b.publication_status = 'published'
      AND (
        b.title ~* ${rx}
        OR coalesce(b.description, '') ~* ${rx}
        OR EXISTS (
          SELECT 1 FROM unnest(coalesce(b.tags, '{}')) t WHERE t ~* ${rx}
        )
      )
    ORDER BY score DESC, random()
    LIMIT ${limit}
  `;

  return rows;
}
