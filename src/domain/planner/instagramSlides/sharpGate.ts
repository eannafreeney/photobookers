// ponytail: single-flight sharp on the 512MB web dyno. Ceiling: all Instagram
// slide renders serialize (preview + queue). Raise concurrency or move rendering
// off-box if wait time becomes painful.
let chain: Promise<unknown> = Promise.resolve();

export function withSharpLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = chain.then(() => fn());
  chain = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}
