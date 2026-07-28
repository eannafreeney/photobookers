/** @jsxImportSource react */

import { Button } from "@react-email/components";

export const ViewButton = ({ href }: { href: string }) => (
  <Button
    href={href}
    style={{
      display: "block",
      width: "50%",
      maxWidth: "100%",
      boxSizing: "border-box",
      margin: "12px auto 0",
      padding: "12px 0",
    }}
    className="bg-white text-black border-outlineStrong border text-xs font-semibold uppercase rounded px-3 py-2 text-center mx-auto"
  >
    View
  </Button>
);
