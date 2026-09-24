import type { Printer } from "../../../../db/schema";
import Card from "../../../../components/app/Card";
import GridPanel from "../../../../components/app/GridPanel";
import Link from "../../../../components/app/Link";
import ScrollReveal from "../../../../components/app/ScrollReveal";

const PrintersList = ({ printers }: { printers: Printer[] }) => {
  return (
    <GridPanel id="printers-grid">
      {printers.length > 0 ? (
        printers.map((printer) => (
          <ScrollReveal>
            <Card>
              {/* {printer.logoUrl ? (
                <Card.Image
                  src={printer.logoUrl}
                  alt={printer.name}
                  href={`/printers/${printer.slug}`}
                />
              ) : null} */}
              <Card.Body>
                <Link href={`/printers/${printer.slug}`}>
                  <Card.Title>{printer.name}</Card.Title>
                </Link>
                <div class="text-sm text-on-surface-weak">
                  {printer.city}, {printer.country}
                </div>
                {/* {printer.specialties ? (
                  <div class="text-sm text-on-surface-weak line-clamp-2">
                    {printer.specialties}
                  </div>
                ) : null} */}
              </Card.Body>
            </Card>
          </ScrollReveal>
        ))
      ) : (
        <div class="col-span-full text-center text-sm text-on-surface py-4">
          No printers yet.
        </div>
      )}
    </GridPanel>
  );
};

export default PrintersList;
