/** @jsxImportSource react */

import type { ReactNode } from "react";
import { Text } from "@react-email/components";
import { brand } from "../constants";

export const Title = ({ children }: { children: ReactNode }) => (
  <Text
    style={{
      color: brand.onSurfaceStrong,
      fontFamily: brand.fontDisplay,
      textAlign: "center",
    }}
    className="m-0 mb-2 text-3xl leading-[1.2] font-medium text-center"
  >
    {children}
  </Text>
);
