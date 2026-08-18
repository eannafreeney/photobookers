function diffPublisherProducts(current, seenKeys) {
  if (seenKeys.size === 0) {
    return { seeded: true, newProducts: [] };
  }
  const newProducts = current.filter((p) => !seenKeys.has(p.key));
  return { seeded: false, newProducts };
}
export {
  diffPublisherProducts
};
