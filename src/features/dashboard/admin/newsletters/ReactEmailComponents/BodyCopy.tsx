/** @jsxImportSource react */

import type { ReactNode } from "react";
import { Text } from "@react-email/components";
import { brand } from "../constants";

export const BodyCopy = ({ children }: { children: ReactNode }) => (
  <Text
    style={{ color: brand.onSurface, textAlign: "center" }}
    className="mt-0 mb-3 text-md leading-[1.6] text-center"
  >
    {children}
  </Text>
);
