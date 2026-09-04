/** @jsxImportSource react */

import { MjmlSection, MjmlColumn, MjmlText } from "mjml-react";
import { NEWSLETTER_COPY } from "../../../../../constants/newsletter";
import { brand, newsletterNavLinks, newsletterSocial } from "../constants";

export const NewsletterFooter = () => (
  <MjmlSection backgroundColor={brand.surface} padding="24px 0 32px">
    <MjmlColumn>
      <MjmlText
        align="center"
        fontSize="14px"
        lineHeight="1.6"
        color={brand.onSurface}
        padding="0 25px 16px"
      >
        {NEWSLETTER_COPY.forwardLine}
      </MjmlText>
      <MjmlText align="center" padding="0 25px 16px">
        {newsletterNavLinks().map((link, index) => (
          <span key={link.href}>
            {index > 0 ? (
              <span style={{ color: brand.onSurfaceWeak }}> · </span>
            ) : null}
            <a
              href={link.href}
              style={{ color: brand.onSurfaceWeak, textDecoration: "none" }}
            >
              {link.label}
            </a>
          </span>
        ))}
      </MjmlText>
      <MjmlText align="center" padding="0 25px 16px">
        <a href={newsletterSocial.instagramUrl}>
          <img
            src={newsletterSocial.instagramIconUrl}
            alt="Instagram"
            width="20"
            height="20"
            style={{ display: "inline-block" }}
          />
        </a>
      </MjmlText>
      <MjmlText
        align="center"
        fontSize="13px"
        color={brand.onSurfaceWeak}
        padding="0 25px"
      >
        © {new Date().getFullYear()} Photobookers
      </MjmlText>
    </MjmlColumn>
  </MjmlSection>
);
