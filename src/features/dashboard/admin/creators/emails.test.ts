import { describe, expect, it } from "vitest";
import { generateBookFeedbackEmail } from "./emails";

describe("generateBookFeedbackEmail", () => {
  it("includes pending-review feedback without rejection copy", () => {
    const html = generateBookFeedbackEmail({
      creatorName: "Sam",
      bookTitle: "Concrete Hours",
      feedback: "Please add the missing publisher.",
    });

    expect(html).toContain("Please add the missing publisher.");
    expect(html).toContain("While reviewing");
    expect(html).not.toContain("unable to approve");
  });
});
