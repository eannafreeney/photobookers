#!/usr/bin/env npx tsx
import "./envMagazine";
import { client } from "../src/db/client";
import { generateIssue } from "../src/features/dashboard/admin/magazine/generate";
import { createDraftIssue } from "../src/domain/magazine/mutations";
import { listAllThemeLabels } from "../src/domain/magazine/queries";

// Usage:
//   npx tsx scripts/generateMagazineIssue.ts "night"        # generate + save draft
//   npx tsx scripts/generateMagazineIssue.ts "night" --dry  # generate only, no save
async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const seed = args.filter((a) => !a.startsWith("--"))[0] ?? null;

  console.log(`\nGenerating a draft issue${seed ? ` (seed: "${seed}")` : ""}…\n`);

  const usedThemes = await listAllThemeLabels();
  const [genError, issue] = await generateIssue({ seed, usedThemes });
  if (genError) {
    console.error("✖", genError.reason);
    await client.end();
    process.exit(1);
  }

  const { theme, movements, books, model, candidateCount } = issue;
  console.log(`Model: ${model}   Candidates retrieved: ${candidateCount}\n`);
  console.log(`══ ${theme.title.toUpperCase()} ══`);
  console.log(`${theme.subtitle}\n`);
  console.log(`Theme: ${theme.theme}`);
  console.log(`Facets: ${theme.facets.join(", ")}\n`);
  console.log(`Editor's letter — ${theme.editorsLetterTitle}`);
  for (const p of theme.editorsLetter) console.log(`  ${p}\n`);

  for (const movement of movements) {
    console.log(`\n── ${movement.kicker}: ${movement.lead} ${movement.title} ──`);
    const inMovement = books.filter((b) => b.movementId === movement.id);
    for (const b of inMovement) {
      const verified = b.candidate.artistStatus === "verified" ? " ✦" : "";
      console.log(
        `  • ${b.candidate.title} — ${b.candidate.artist ?? "unknown"}${verified}`,
      );
      console.log(`    ${b.blurb}`);
      if (b.artistPrompt) console.log(`    ? ${b.artistPrompt}`);
    }
  }

  console.log(`\nSelected ${books.length} books.\n`);

  if (dry) {
    console.log("--dry: not saved.");
    await client.end();
    return;
  }

  const [saveError, saved] = await createDraftIssue({
    title: theme.title,
    subtitle: theme.subtitle,
    kicker: theme.kicker,
    theme: theme.theme,
    editorsLetterTitle: theme.editorsLetterTitle,
    editorsLetter: theme.editorsLetter,
    movements,
    generationSeed: seed,
    generationModel: model,
    books: books.map((b) => ({
      bookId: b.bookId,
      movementId: b.movementId,
      sortOrder: b.sortOrder,
      blurb: b.blurb,
      artistPrompt: b.artistPrompt ?? null,
    })),
  });
  if (saveError) {
    console.error("✖", saveError.reason);
    await client.end();
    process.exit(1);
  }

  console.log(`✓ Saved draft: ${saved.slug} (${saved.id})`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
