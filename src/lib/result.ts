type Result<S, E extends { reason: string }> = [E, null] | [null, S];

export const ok = <S>(data: S): Result<S, never> => [null, data];
export const err = <E extends { reason: string }>(
  error: E,
): Result<never, E> => [error, null];

export const isOk = <S, E extends { reason: string }>(
  result: Result<S, E>,
): result is [null, S] => result[0] === null;

export const isErr = <S, E extends { reason: string }>(
  result: Result<S, E>,
): result is [E, null] => result[0] !== null;

export function match<S, E extends { reason: string }, R>(
  result: Result<S, E>,
  arms: {
    ok: (data: S) => R;
    err: (error: E) => R;
  },
): R {
  const [e, data] = result;
  if (e !== null) {
    return arms.err(e);
  }
  return arms.ok(data as S); // data is S when e is null
}
