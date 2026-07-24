/** @jsxImportSource react */

import type { ReactNode } from "react";
import { Text } from "@react-email/components";
import { brand } from "../constants";

export const Kicker = ({ children }: { children: ReactNode }) => (
  <Text
    style={{ color: brand.accent }}
    className="m-0 mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] leading-[1.2]"
  >
    {children}
  </Text>
);
