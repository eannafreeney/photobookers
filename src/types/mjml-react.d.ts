declare module "mjml-react" {
  import type { ReactElement } from "react";

  export function render(
    element: ReactElement,
    options?: Record<string, unknown>,
  ): { html: string; errors: unknown[] };

  export const Mjml: (props: Record<string, unknown>) => ReactElement;
  export const MjmlHead: (props: Record<string, unknown>) => ReactElement;
  export const MjmlTitle: (props: Record<string, unknown>) => ReactElement;
  export const MjmlFont: (props: Record<string, unknown>) => ReactElement;
  export const MjmlStyle: (props: Record<string, unknown>) => ReactElement;
  export const MjmlAttributes: (props: Record<string, unknown>) => ReactElement;
  export const MjmlBreakpoint: (props: Record<string, unknown>) => ReactElement;
  export const MjmlAll: (props: Record<string, unknown>) => ReactElement;
  export const MjmlBody: (props: Record<string, unknown>) => ReactElement;
  export const MjmlWrapper: (props: Record<string, unknown>) => ReactElement;
  export const MjmlSection: (props: Record<string, unknown>) => ReactElement;
  export const MjmlGroup: (props: Record<string, unknown>) => ReactElement;
  export const MjmlColumn: (props: Record<string, unknown>) => ReactElement;
  export const MjmlText: (props: Record<string, unknown>) => ReactElement;
  export const MjmlButton: (props: Record<string, unknown>) => ReactElement;
  export const MjmlImage: (props: Record<string, unknown>) => ReactElement;
  export const MjmlDivider: (props: Record<string, unknown>) => ReactElement;
}
