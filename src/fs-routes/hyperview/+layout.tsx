import { FC, PropsWithChildren } from "hono/jsx";
import { Doc, Screen, Header, Body, Styles, Style } from "../../lib/hxml-comps";
import { Child } from "hono/jsx";
import { raw } from "hono/html";
import { xmlText } from "../../lib/hxml";

export const AppLayout: FC<
  PropsWithChildren<{
    title: string;
    extraStyles?: Child;
    showBackButton?: boolean;
  }>
> = ({ title, children, extraStyles, showBackButton = true }) => (
  <Doc xmlns="https://hyperview.org/hyperview">
    <Screen>
      <Styles>
        <Style id="body" flex={1} backgroundColor="#f8f7f5" />
        <Style id="list" flex={1} />

        <Style id="content" flex={1} />
        <Style
          id="custom-header"
          backgroundColor="#ffffff"
          paddingTop={52}
          paddingBottom={12}
          paddingLeft={16}
          paddingRight={16}
          borderBottomWidth={1}
          borderBottomColor="#e5e5e5"
          flexDirection="row"
          alignItems="center"
        />
        <Style
          id="header-title"
          fontSize={18}
          fontWeight="700"
          color="#111111"
          flex={1}
        />
        <Style id="back-btn" fontSize={16} color="#3366cc" marginRight={12} />
        <Style
          id="tab-bar"
          flexDirection="row"
          borderBottomWidth={1}
          borderBottomColor="#e5e5e5"
          marginBottom={12}
          alignItems="center"
          justifyContent="center"
          gap={12}
        />
        <Style
          id="tab-btn"
          flex={1}
          paddingTop={10}
          paddingBottom={10}
          alignItems="center"
        />
        <Style id="tab-label" fontSize={13} fontWeight="600" color="#666666" />
        <Style id="tab-content" flex={1} />
        {extraStyles}
      </Styles>
      <Body style="body">
        {raw(`<view style="custom-header">
          <behavior trigger="press" action="back" />
          ${showBackButton ? `<text style="back-btn">←</text>` : ""}
          <text style="header-title">${xmlText(title)}</text>
        </view>`)}
        {children}
      </Body>
    </Screen>
  </Doc>
);
