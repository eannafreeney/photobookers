import Link from "@/components/app/Link";
import Button, { button } from "../../../../components/app/Button";
import type { Printer, PrinterImage } from "../../../../db/schema";
import type { PrintedBookLink } from "../rules";
import ExpandableDescription from "../../components/ExpandableDescription";

type Props = {
  printer: Printer & {
    images: PrinterImage[];
    printedBooks: PrintedBookLink[];
  };
};

const PrinterDetail = ({ printer }: Props) => {
  return (
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header class="flex flex-col gap-4">
        {printer.bannerUrl ? (
          <img
            src={printer.bannerUrl}
            alt={printer.name}
            class="w-full object-cover border border-outline"
          />
        ) : null}
        <div class="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div class="flex flex-col gap-2">
            <h1 class="font-display text-4xl md:text-6xl text-on-surface-strong">
              {printer.name}
            </h1>
            <p class="text-on-surface">
              {printer.city}, {printer.country}
            </p>
          </div>
          <div class="flex flex-wrap justify-center gap-3">
            <Link
              href={`/printers/request?printer=${printer.slug}`}
              xTarget="modal-root"
            >
              <Button color="primary" width="fit">
                Request a Quote
              </Button>
            </Link>
            {printer.website ? (
              <a
                href={printer.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" color="primary" width="auto">
                  Website
                </Button>
              </a>
            ) : null}
          </div>
        </div>
      </header>
      {printer.description ? (
        <ExpandableDescription text={printer.description} />
      ) : null}

      {printer.printedBooks.length > 0 ? (
        <section class="flex flex-col gap-4">
          <h2 class="font-display text-2xl text-on-surface-strong">
            Printed by {printer.name}
          </h2>
          <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {printer.printedBooks.map((book) => (
              <li>
                <Link href={`/books/${book.slug}`} className="block">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      class="aspect-3/4 w-full border border-outline object-cover"
                    />
                  ) : (
                    <div class="aspect-3/4 w-full border border-outline bg-surface-alt" />
                  )}
                  <p class="mt-2 text-sm text-on-surface-strong">
                    {book.title}
                  </p>
                  {book.artistName ? (
                    <p class="text-xs text-on-surface">{book.artistName}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {printer.images.length > 0 ? (
        <section class="flex flex-col gap-4">
          <h2 class="font-display text-2xl text-on-surface-strong">Gallery</h2>
          <ul class="flex flex-col gap-4">
            {printer.images.map((image) => (
              <li>
                <img
                  src={image.imageUrl}
                  alt=""
                  class="w-full object-cover border border-outline"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};

export default PrinterDetail;
