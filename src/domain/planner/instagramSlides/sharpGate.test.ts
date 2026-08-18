import { describe, expect, it } from "vitest";
import { withSharpLock } from "./sharpGate";

describe("withSharpLock", () => {
  it("runs tasks one at a time", async () => {
    const order: string[] = [];
    let releaseFirst!: () => void;
    const firstGate = new Promise<void>((r) => {
      releaseFirst = r;
    });

    const first = withSharpLock(async () => {
      order.push("first-start");
      await firstGate;
      order.push("first-end");
      return 1;
    });

    const second = withSharpLock(async () => {
      order.push("second");
      return 2;
    });

    await Promise.resolve();
    expect(order).toEqual(["first-start"]);

    releaseFirst();
    await expect(Promise.all([first, second])).resolves.toEqual([1, 2]);
    expect(order).toEqual(["first-start", "first-end", "second"]);
  });
});
