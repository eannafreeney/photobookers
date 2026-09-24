import Button from "../../../../components/app/Button";
import type { Printer, PrinterImage, PrintQuoteNote } from "../../../../db/schema";

type Note = PrintQuoteNote & {
  user: { firstName: string | null; lastName: string | null };
};

type Props = {
  printer: Printer & { images: PrinterImage[]; notes: Note[] };
  canNote: boolean;
};

const PrinterDetail = ({ printer, canNote }: Props) => {
  return (
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-10">
      <header class="flex flex-col gap-3">
        <h1 class="font-display text-4xl md:text-6xl text-on-surface-strong">
          {printer.name}
        </h1>
        <p class="text-on-surface">
          {printer.city}, {printer.country}
        </p>
        {printer.specialties ? (
          <p class="text-on-surface">{printer.specialties}</p>
        ) : null}
        {printer.description ? (
          <p class="max-w-2xl text-on-surface text-pretty">{printer.description}</p>
        ) : null}
        <div class="flex flex-wrap gap-3">
          <a href={`/printers/request?printer=${printer.slug}`}>
            <Button variant="solid" color="primary" width="auto">
              Ask this printer
            </Button>
          </a>
          {printer.website ? (
            <a href={printer.website} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" color="primary" width="auto">
                Website
              </Button>
            </a>
          ) : null}
        </div>
      </header>

      {printer.images.length > 0 ? (
        <ul class="grid grid-cols-2 gap-3 md:grid-cols-3">
          {printer.images.map((image) => (
            <li>
              <img
                src={image.imageUrl}
                alt=""
                class="aspect-[3/4] w-full object-cover border border-outline"
              />
            </li>
          ))}
        </ul>
      ) : null}

      <section class="flex flex-col gap-4">
        <h2 class="font-display text-2xl text-on-surface-strong">Notes</h2>
        {printer.notes.length === 0 ? (
          <p class="text-sm text-on-surface-weak">No notes yet.</p>
        ) : (
          <ul class="flex flex-col gap-4">
            {printer.notes.map((note) => (
              <li class="border border-outline p-4">
                <p class="text-sm text-on-surface-weak">
                  {[note.user.firstName, note.user.lastName].filter(Boolean).join(" ") ||
                    "A member"}
                  {note.replied ? " · replied" : ""}
                  {note.printed ? " · printed the book" : ""}
                </p>
                <p class="mt-2 text-on-surface text-pretty">{note.body}</p>
              </li>
            ))}
          </ul>
        )}
        {canNote ? (
          <form
            method="post"
            action={`/printers/${printer.slug}/note`}
            class="flex flex-col gap-3 border border-outline p-4"
          >
            <p class="text-sm text-on-surface">
              You asked this printer for a quote. Leave a short note.
            </p>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" name="replied" />
              They replied
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" name="printed" />
              They printed the book
            </label>
            <textarea
              name="body"
              required
              minLength={10}
              rows={4}
              class="w-full border border-outline bg-surface px-3 py-2 text-sm"
              placeholder="A few sentences about working with them"
            />
            <Button variant="solid" color="primary" width="fit">
              Save note
            </Button>
          </form>
        ) : null}
      </section>
    </div>
  );
};

export default PrinterDetail;
