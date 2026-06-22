// Normalized string for matching (removes hyphens, normalizes to lowercase)
function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Mark}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export type BookForMatching = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
};

export type FileMatch = {
  file: File;
  matchedBookId: string | null;
  confidence: "exact" | "fuzzy" | "none";
};

export type MatchResult = {
  matched: Array<{ file: File; bookId: string; bookTitle: string }>;
  unmatchedFiles: File[];
  unmatchedBooks: BookForMatching[];
};

function normalizeForMatching(text: string): string {
  return slugify(text).replace(/-/g, "");
}

function getFilenameWithoutExtension(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

export function matchCoversByFilename(
  files: File[],
  books: BookForMatching[],
): MatchResult {
  const matched: Array<{ file: File; bookId: string; bookTitle: string }> = [];
  const unmatchedFiles: File[] = [];
  const matchedBookIds = new Set<string>();

  // Try to match each file
  for (const file of files) {
    const filename = getFilenameWithoutExtension(file.name);
    const normalizedFilename = normalizeForMatching(filename);

    // Find exact or fuzzy match
    let bestMatch: BookForMatching | null = null;
    let bestScore = 0;

    for (const book of books) {
      if (matchedBookIds.has(book.id)) continue;

      const normalizedTitle = normalizeForMatching(book.title);
      const normalizedSlug = normalizeForMatching(book.slug);

      // Exact match
      if (
        normalizedFilename === normalizedTitle ||
        normalizedFilename === normalizedSlug
      ) {
        bestMatch = book;
        bestScore = 1;
        break;
      }

      // Fuzzy match (contains or is contained)
      if (
        normalizedFilename.includes(normalizedTitle) ||
        normalizedTitle.includes(normalizedFilename)
      ) {
        const score = 0.5;
        if (score > bestScore) {
          bestMatch = book;
          bestScore = score;
        }
      }
    }

    if (bestMatch && bestScore >= 0.5) {
      matched.push({
        file,
        bookId: bestMatch.id,
        bookTitle: bestMatch.title,
      });
      matchedBookIds.add(bestMatch.id);
    } else {
      unmatchedFiles.push(file);
    }
  }

  const unmatchedBooks = books.filter((b) => !matchedBookIds.has(b.id));

  return { matched, unmatchedFiles, unmatchedBooks };
}
