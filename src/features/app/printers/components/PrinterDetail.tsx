import Button, { button } from "../../../../components/app/Button";
import type { Printer, PrinterImage } from "../../../../db/schema";

type Props = {
  printer: Printer & { images: PrinterImage[] };
};

const PrinterDetail = ({ printer }: Props) => {
  return (
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <header class="flex flex-col gap-4">
        {/* {printer.logoUrl ? (
          <img
            src={printer.logoUrl}
            alt=""
            class="h-16 w-auto object-contain"
          />
        ) : null} */}
        <h1 class="font-display text-4xl md:text-6xl text-on-surface-strong">
          {printer.name}
        </h1>
        <p class="text-on-surface">
          {printer.city}, {printer.country}
        </p>
        {printer.specialties ? (
          <p class="text-on-surface">{printer.specialties}</p>
        ) : null}
        {printer.languages ? (
          <p class="text-sm text-on-surface-weak">{printer.languages}</p>
        ) : null}
        {printer.description ? (
          <p class="max-w-2xl text-on-surface text-pretty">
            {printer.description}
          </p>
        ) : null}
        <div class="flex flex-wrap justify-center gap-3">
          <a
            href={`/printers/request?printer=${printer.slug}`}
            class={button({
              variant: "solid",
              color: "primary",
              width: "auto",
            })}
            {...{ "x-target": "modal-root" }}
          >
            Ask this printer
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
      ) : null}
    </div>
  );
};

export default PrinterDetail;
