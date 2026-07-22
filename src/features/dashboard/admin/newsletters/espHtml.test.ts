import { describe, expect, it } from "vitest";
import { prepareNewsletterHtmlForEsp } from "./espHtml";

describe("prepareNewsletterHtmlForEsp", () => {
  it("keeps hybrid inline-block layout on feature columns", () => {
    const html = `<!DOCTYPE html><html><head><style>
.feature-col { width: 33.33%; display: table-cell; }
</style></head><body>
<table><tr><td>
<div class="feature-col" style="display:inline-block;width:100%;max-width:190px;padding:8px">A</div>
<div class="feature-col" style="display:inline-block;width:100%;max-width:190px;padding:8px">B</div>
</td></tr></table>
</body></html>`;

    const prepared = prepareNewsletterHtmlForEsp(html);

    expect(prepared).toMatch(
      /class="feature-col" style="[^"]*display:inline-block[^"]*width:100%[^"]*max-width:190px/,
    );
    expect(prepared).not.toMatch(
      /class="feature-col" style="[^"]*width:\s*33\.33%/,
    );
    expect(prepared).not.toMatch(/class="feature-col"[^>]*width=/);
  });
});
