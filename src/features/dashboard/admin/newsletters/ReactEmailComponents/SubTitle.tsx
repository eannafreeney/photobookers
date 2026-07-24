/** @jsxImportSource react */

import type { ReactNode } from "react";
import { Text } from "@react-email/components";
import { brand } from "../constants";

export const SubTitle = ({ children }: { children: ReactNode }) => (
  <Text
    style={{ color: brand.onSurface, textAlign: "center" }}
    className="m-0 text-md leading-normal text-center"
  >
    {children}
  </Text>
);
