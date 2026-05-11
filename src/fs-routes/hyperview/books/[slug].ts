import { createRoute } from "hono-fsr";
import { hxml, xmlText } from "../../../lib/hxml";
import { getBookBySlug } from "../../../features/app/services";
import { slugSchema } from "../../../features/app/schema";
import { paramValidator } from "../../../lib/validator";

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const [error, result] = await getBookBySlug(slug);

  if (error || !result?.book) {
    return hxml(
      c,
      `<screen>
        <styles>
          <style id="body" backgroundColor="#f8f7f5" flex="1" />
          <style id="center" flex="1" alignItems="center" justifyContent="center" />
          <style id="error-text" fontSize="16" color="#cc0000" />
        </styles>
        <body style="body">
          <view style="center">
            <text style="error-text">Book not found.</text>
          </view>
        </body>
      </screen>`,
      404,
    );
  }

  const { book } = result;
  const title = xmlText(book.title);
  const artist = xmlText(book.artist?.displayName ?? "");
  const publisher = xmlText(book.publisher?.displayName ?? "");
  const artistSlug = book.artist?.slug ?? "";
  const publisherSlug = book.publisher?.slug ?? "";
  const cover = book.coverUrl ?? "";
  const releaseYear = book.releaseDate
    ? new Date(book.releaseDate).getFullYear()
    : "";

  const proto = c.req.header("x-forwarded-proto") ?? "http";
  const host = c.req.header("host") ?? "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  const galleryImages: string[] =
    book.images
      ?.map((img: { imageUrl: string }) => img.imageUrl)
      .filter(Boolean) ?? [];

  const coverSection = cover
    ? `<image style="cover-image" source="${cover}" />`
    : `<view style="cover-placeholder" />`;

  const gallerySection =
    galleryImages.length > 0
      ? `<view style="gallery">
          ${galleryImages
            .slice(0, 4)
            .map(
              (url: string) =>
                `<image style="gallery-image" source="${url}" />`,
            )
            .join("\n")}
        </view>`
      : "";

  const artistRow =
    artist && artistSlug
      ? `<view style="meta-row">
          <text style="meta-label">Artist</text>
          <text style="meta-value meta-link">
            <behavior trigger="press" action="push" href="${baseUrl}/hyperview/creators/${artistSlug}" />
            ${artist}
          </text>
        </view>`
      : "";

  const publisherRow =
    publisher && publisherSlug
      ? `<view style="meta-row">
          <text style="meta-label">Publisher</text>
          <text style="meta-value meta-link">
            <behavior trigger="press" action="push" href="${baseUrl}/hyperview/creators/${publisherSlug}" />
            ${publisher}
          </text>
        </view>`
      : "";

  const yearRow = releaseYear
    ? `<view style="meta-row">
        <text style="meta-label">Year</text>
        <text style="meta-value">${releaseYear}</text>
      </view>`
    : "";

  return hxml(
    c,
    `<screen>
      <styles>
        <style id="body" backgroundColor="#f8f7f5" flex="1" />
        <style id="scroll" flex="1" />
        <style id="scroll-content" paddingBottom="32" />
        <style id="cover-image" width="100%" height="320" />
        <style id="cover-placeholder" width="100%" height="320" backgroundColor="#e0e0e0" />
        <style id="content" paddingTop="20" paddingLeft="16" paddingRight="16" />
        <style id="title" fontSize="22" fontWeight="700" color="#111111" marginBottom="4" />
        <style id="meta-row" flexDirection="row" marginBottom="8" />
        <style id="meta-label" fontSize="13" color="#888888" width="80" />
        <style id="meta-value" fontSize="14" color="#111111" flex="1" />
        <style id="meta-link" color="#3366cc" />
        <style id="gallery" flexDirection="row" flexWrap="wrap" marginTop="20" />
        <style id="gallery-image" width="50%" height="180" />
        <style id="divider" height="1" backgroundColor="#e5e5e5" marginTop="16" marginBottom="16" />
      </styles>
      <body style="body">
        <scroll-view style="scroll" content-container-style="scroll-content">
          ${coverSection}
          <view style="content">
            <text style="title">${title}</text>
            ${artistRow}
            ${publisherRow}
            ${yearRow}
          </view>
          ${gallerySection}
        </scroll-view>
      </body>
    </screen>`,
  );
});
