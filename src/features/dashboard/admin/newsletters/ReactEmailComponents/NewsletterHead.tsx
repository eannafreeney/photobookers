/** @jsxImportSource react */

import { Head, Font } from "@react-email/components";

export const NewsletterHead = ({ title }: { title: string }) => (
  <Head>
    <title>{title}</title>
    <Font
      fontFamily="Instrument Sans"
      fallbackFontFamily="sans-serif"
      webFont={{
        url: "https://fonts.gstatic.com/s/instrumentsans/v4/pximypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr-yp2JGEJOH9npSTF-Qf1.ttf",
        format: "truetype",
      }}
      fontWeight={400}
    />
    <Font
      fontFamily="Fraunces"
      fallbackFontFamily="serif"
      webFont={{
        url: "https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIchRujDg.ttf",
        format: "truetype",
      }}
      fontWeight={500}
    />
    <Font
      fontFamily="Caveat"
      fallbackFontFamily="serif"
      webFont={{
        url: "https://fonts.gstatic.com/s/caveat/v23/WnznHAc5bAfYB2QRah7pcpNvOx-pjSx6SII.ttf",
        format: "truetype",
      }}
      fontWeight={600}
    />
    <Font
      fontFamily="Instrument Sans"
      fallbackFontFamily="sans-serif"
      webFont={{
        url: "https://fonts.gstatic.com/s/instrumentsans/v4/pximypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr-yp2JGEJOH9npST3-Qf1.ttf",
        format: "truetype",
      }}
      fontWeight={500}
    />
    <Font
      fontFamily="Instrument Sans"
      fallbackFontFamily="sans-serif"
      webFont={{
        url: "https://fonts.gstatic.com/s/instrumentsans/v4/pximypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr-yp2JGEJOH9npSQb_gf1.ttf",
        format: "truetype",
      }}
      fontWeight={600}
    />
    <Font
      fontFamily="Instrument Sans"
      fallbackFontFamily="sans-serif"
      webFont={{
        url: "https://fonts.gstatic.com/s/instrumentsans/v4/pximypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr-yp2JGEJOH9npSQi_gf1.ttf",
        format: "truetype",
      }}
      fontWeight={700}
    />
    <Font
      fontFamily="Fraunces"
      fallbackFontFamily="serif"
      webFont={{
        url: "https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcaRyjDg.ttf",
        format: "truetype",
      }}
      fontWeight={600}
    />
  </Head>
);
