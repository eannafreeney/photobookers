const ok = (data) => [null, data];
const err = (error) => [error, null];
const isOk = (result) => result[0] === null;
const isErr = (result) => result[0] !== null;
function match(result, arms) {
  const [e, data] = result;
  if (e !== null) {
    return arms.err(e);
  }
  return arms.ok(data);
}
export {
  err,
  isErr,
  isOk,
  match,
  ok
};
