import { createRoute } from "hono-fsr";
import { hxml, xmlText } from "../../lib/hxml";
import { getLatestBooks } from "../../features/app/services";
import type { BookCardResult } from "../../constants/queries";

function bookRow(book: BookCardResult, baseUrl: string): string {
  const title = xmlText(book.title);
  const artist = xmlText(
    book.artist?.displayName ?? book.publisher?.displayName ?? "",
  );
  const cover = book.coverUrl ?? "";
  const detailUrl = `${baseUrl}/hyperview/books/${book.slug}`;

  return `
    <item key="${book.id}" style="item">
      <behavior trigger="press" action="push" href="${detailUrl}" />
      <view style="item-inner">
        ${cover ? `<image style="cover" source="${cover}" />` : `<view style="cover-placeholder" />`}
        <view style="item-text">
          <text style="item-title">${title}</text>
          ${artist ? `<text style="item-subtitle">${artist}</text>` : ""}
        </view>
        <text style="chevron">›</text>
      </view>
    </item>`;
}

export const GET = createRoute(async (c) => {
  const [error, result] = await getLatestBooks(1, 30);

  if (error) {
    return hxml(
      c,
      `<screen>
        <body style="body">
          <view style="center">
            <text style="error-text">Failed to load books.</text>
          </view>
        </body>
      </screen>`,
    );
  }

  const proto = c.req.header("x-forwarded-proto") ?? "http";
  const host = c.req.header("host") ?? "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  const rows = result.books.map((b) => bookRow(b, baseUrl)).join("\n");

  return hxml(
    c,
    `<screen>
      <styles>
        <style id="body" backgroundColor="#f8f7f5" flex="1" />
        <style id="header" backgroundColor="#ffffff" paddingTop="52" paddingBottom="12" paddingLeft="16" paddingRight="16" borderBottomWidth="1" borderBottomColor="#e5e5e5" />
        <style id="header-title" fontSize="24" fontWeight="700" color="#111111" />
        <style id="list" flex="1" />
        <style id="item" backgroundColor="#ffffff" borderBottomWidth="1" borderBottomColor="#f0f0f0" />
        <style id="item-inner" flexDirection="row" alignItems="center" paddingTop="12" paddingBottom="12" paddingLeft="16" paddingRight="16" />
        <style id="cover" width="56" height="72" borderRadius="4" marginRight="12" />
        <style id="cover-placeholder" width="56" height="72" borderRadius="4" marginRight="12" backgroundColor="#e0e0e0" />
        <style id="item-text" flex="1" />
        <style id="item-title" fontSize="15" fontWeight="600" color="#111111" marginBottom="2" />
        <style id="item-subtitle" fontSize="13" color="#666666" />
        <style id="chevron" fontSize="20" color="#cccccc" marginLeft="8" />
        <style id="center" flex="1" alignItems="center" justifyContent="center" />
        <style id="error-text" fontSize="16" color="#cc0000" />
      </styles>
      <body style="body">
        <view style="header">
          <text style="header-title">Photobookers</text>
        </view>
        <list style="list">
          <section>
            ${rows}
          </section>
        </list>
      </body>
    </screen>`,
  );
});
