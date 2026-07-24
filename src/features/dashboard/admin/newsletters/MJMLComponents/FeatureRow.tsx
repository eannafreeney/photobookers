/** @jsxImportSource react */

import type { ReactNode } from "react";
import { MjmlSection } from "mjml-react";
import { brand } from "../constants";

/** mj-section wrapper for one or more mj-columns (never nest sections). */
export const FeatureRow = ({ children }: { children: ReactNode }) => (
  <MjmlSection backgroundColor={brand.surface} padding="0 25px 24px">
    {children}
  </MjmlSection>
);
