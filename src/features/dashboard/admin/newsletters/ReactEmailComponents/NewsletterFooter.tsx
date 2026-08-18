/** @jsxImportSource react */

import { Section, Row, Column, Text, Button, Img } from "@react-email/components";
import { brand, newsletterNavLinks, newsletterSocial } from "../constants";

export const NewsletterFooter = () => (
  <Section>
    <Row>
      <Column>
        <Text
          style={{ color: brand.onSurface }}
          className="m-0 text-sm leading-[1.6] px-[25px] text-center"
        >
          The home for photobook lovers. Discover books, follow artists and
          publishers, and keep up with the photobook world.
        </Text>

        <Section className="text-center my-6">
          {newsletterNavLinks().map((link, index) => (
            <span key={link.href}>
              {index > 0 ? (
                <span style={{ color: brand.onSurfaceWeak }}> · </span>
              ) : null}
              <Button href={link.href} style={{ color: brand.onSurfaceWeak }}>
                {link.label}
              </Button>
            </span>
          ))}
        </Section>

        <Section className="text-center mb-6">
          <Button href={newsletterSocial.instagramUrl}>
            <Img
              src={newsletterSocial.instagramIconUrl}
              alt="Instagram"
              width="20"
              height="20"
              style={{ display: "block", margin: "0 auto" }}
            />
          </Button>
        </Section>

        <Text
          style={{ color: brand.onSurfaceWeak }}
          className="m-0 text-sm leading-[1.6] px-[25px] text-center"
        >
          © {new Date().getFullYear()} Photobookers
        </Text>
      </Column>
    </Row>
  </Section>
);
