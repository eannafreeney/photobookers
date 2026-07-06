function slugify(text) {
  return text.normalize("NFD").replace(new RegExp("\\p{Mark}", "gu"), "").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function normalizeForMatching(text) {
  return slugify(text).replace(/-/g, "");
}
function getFilenameWithoutExtension(filename) {
  return filename.replace(/\.[^.]+$/, "");
}
function matchCoversByFilename(files, books) {
  const matched = [];
  const unmatchedFiles = [];
  const matchedBookIds = /* @__PURE__ */ new Set();
  for (const file of files) {
    const filename = getFilenameWithoutExtension(file.name);
    const normalizedFilename = normalizeForMatching(filename);
    let bestMatch = null;
    let bestScore = 0;
    for (const book of books) {
      if (matchedBookIds.has(book.id)) continue;
      const normalizedTitle = normalizeForMatching(book.title);
      const normalizedSlug = normalizeForMatching(book.slug);
      if (normalizedFilename === normalizedTitle || normalizedFilename === normalizedSlug) {
        bestMatch = book;
        bestScore = 1;
        break;
      }
      if (normalizedFilename.includes(normalizedTitle) || normalizedTitle.includes(normalizedFilename)) {
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
        bookTitle: bestMatch.title
      });
      matchedBookIds.add(bestMatch.id);
    } else {
      unmatchedFiles.push(file);
    }
  }
  const unmatchedBooks = books.filter((b) => !matchedBookIds.has(b.id));
  return { matched, unmatchedFiles, unmatchedBooks };
}
export {
  matchCoversByFilename
};
