import type { Printer } from "../../../../db/schema";

const PrintersList = ({ printers }: { printers: Printer[] }) => {
  if (printers.length === 0) {
    return (
      <p class="text-center py-12 text-on-surface-weak">No printers yet.</p>
    );
  }

  return (
    <ul class="flex flex-col divide-y divide-outline border-y border-outline">
      {printers.map((printer) => (
        <li>
          <a
            href={`/printers/${printer.slug}`}
            class="flex flex-col gap-1 py-4 hover:text-accent"
          >
            <span class="font-display text-2xl text-on-surface-strong">
              {printer.name}
            </span>
            <span class="text-sm text-on-surface">
              {printer.city}, {printer.country}
            </span>
            {printer.specialties ? (
              <span class="text-sm text-on-surface-weak">
                {printer.specialties}
              </span>
            ) : null}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default PrintersList;
