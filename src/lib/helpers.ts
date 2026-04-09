import { Effect } from "effect";

export type TryCatchError = {
  reason: string;
  cause?: unknown;
};

export const tryCatch = <A>(
  f: () => Promise<A>,
  reason: string,
): Effect.Effect<A, TryCatchError> =>
  Effect.tryPromise({
    try: f,
    catch: (cause) => ({ reason, cause }),
  });
