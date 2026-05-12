import { FC, PropsWithChildren } from "hono/jsx";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StyleProp = { style?: string };
type IdProp = { id?: string };
type BaseProps = PropsWithChildren<StyleProp & IdProp>;

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export const View: FC<BaseProps> = ({ style, id, children }) => (
  <view style={style} id={id}>
    {children}
  </view>
);

export const SafeAreaView: FC<BaseProps> = ({ id, children }) => (
  <view style="margin: 0px 20px 0px 20px;" id={id}>
    {children}
  </view>
);

export const ScrollView: FC<
  PropsWithChildren<{
    style?: string;
    "content-container-style"?: string;
    horizontal?: "true";
  }>
> = (props) => <scroll-view {...props} />;

type DocProps = PropsWithChildren<{ xmlns: string }>;

export const Doc = ({ children }: DocProps) => (
  <doc xmlns="https://hyperview.org/hyperview">{children}</doc>
);

export const Screen: FC<BaseProps> = ({ style, children }) => (
  <screen style={style}>{children}</screen>
);

export const Body: FC<BaseProps & { scroll?: "true" }> = ({
  id,
  scroll = "true",
  style,
  children,
}) => (
  <body id={id} scroll={scroll} style={style}>
    {children}
  </body>
);
// Native navigation header bar
// In Hyperview, <text key="title"> sets the nav bar title
export const Header: FC<PropsWithChildren<{ style?: string }>> = ({
  style,
  children,
}) => <header style={style}>{children}</header>;

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export const List: FC<BaseProps> = ({ style, id, children }) => (
  <list style={style} id={id}>
    {children}
  </list>
);

export const Section: FC<PropsWithChildren> = ({ children }) => (
  <section>{children}</section>
);

export const SectionTitle: FC<BaseProps> = ({ style, children }) => (
  <section-title style={style}>{children}</section-title>
);

export const Item: FC<
  PropsWithChildren<StyleProp & { key?: string | number }>
> = ({ style, key, children }) => (
  <item style={style} key={key}>
    {children}
  </item>
);

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export const Image: FC<{
  style?: string;
  source: string;
  "resize-mode"?: "cover" | "contain" | "stretch" | "center";
}> = (props) => <image {...props} />;

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

export const Behavior: FC<{
  trigger: string;
  action: string;
  href?: string;
  verb?: "get" | "post" | "put" | "delete";
  target?: string;
  once?: "true";
}> = (props) => <behavior {...props} />;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export const Styles: FC<PropsWithChildren> = ({ children }) => (
  <styles>{children}</styles>
);

// Style props are open-ended (all RN layout/typography props)
export const Style: FC<Record<string, string | number>> = (props) => (
  <style {...props} />
);

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

export const Form: FC<PropsWithChildren<{ id?: string }>> = ({
  id,
  children,
}) => <form id={id}>{children}</form>;

export const TextField: FC<{
  style?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  "keyboard-type"?: string;
  "secure-text-entry"?: "true";
}> = (props) => <text-field {...props} />;

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

export const Spinner: FC<StyleProp> = ({ style }) => <spinner style={style} />;

export const Text = ({ style, id, children }: BaseProps) => (
  <text style={style} id={id}>
    {children}
  </text>
);
