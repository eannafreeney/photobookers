let chain = Promise.resolve();
function withSharpLock(fn) {
  const next = chain.then(() => fn());
  chain = next.then(
    () => void 0,
    () => void 0
  );
  return next;
}
export {
  withSharpLock
};
