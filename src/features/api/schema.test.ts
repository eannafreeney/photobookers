import { describe, expect, it } from "vitest";
import {
  addCommentFormSchema,
  commentIdSchema,
  editCommentParamSchema,
  newsletterFormSchema,
} from "./schema";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";
const validUuidUpper = "550E8400-E29B-41D4-A716-446655440000";

describe("addCommentFormSchema", () => {
  it("accepts a non-empty trimmed comment", () => {
    const parsed = addCommentFormSchema.parse({ body: "  hello  " });
    expect(parsed.body).toBe("hello");
  });

  it("rejects empty and whitespace-only body", () => {
    expect(() => addCommentFormSchema.parse({ body: "" })).toThrow();
    expect(() => addCommentFormSchema.parse({ body: "   \t  " })).toThrow();
  });

  it("rejects body longer than 1000 characters", () => {
    const long = "a".repeat(1001);
    expect(() => addCommentFormSchema.parse({ body: long })).toThrow();
  });

  it("accepts body of exactly 1000 characters", () => {
    const body = "a".repeat(1000);
    const parsed = addCommentFormSchema.parse({ body });
    expect(parsed.body).toHaveLength(1000);
  });
});

describe("newsletterFormSchema", () => {
  it("accepts a valid email", () => {
    const parsed = newsletterFormSchema.parse({ email: "user@example.com" });
    expect(parsed.email).toBe("user@example.com");
  });

  it("rejects invalid email", () => {
    expect(() =>
      newsletterFormSchema.parse({ email: "not-an-email" }),
    ).toThrow();
  });
});

describe("commentIdSchema", () => {
  it("parses a valid UUID and lowercases it", () => {
    const parsed = commentIdSchema.parse({ commentId: validUuidUpper });
    expect(parsed.commentId).toBe(validUuid);
  });

  it("rejects invalid UUID", () => {
    expect(() =>
      commentIdSchema.parse({ commentId: "not-a-uuid" }),
    ).toThrow();
  });
});

describe("editCommentParamSchema", () => {
  it("parses bookId and commentId UUIDs", () => {
    const parsed = editCommentParamSchema.parse({
      bookId: validUuid,
      commentId: validUuidUpper,
    });
    expect(parsed.bookId).toBe(validUuid);
    expect(parsed.commentId).toBe(validUuid);
  });

  it("rejects invalid bookId", () => {
    expect(() =>
      editCommentParamSchema.parse({
        bookId: "bad",
        commentId: validUuid,
      }),
    ).toThrow();
  });
});
