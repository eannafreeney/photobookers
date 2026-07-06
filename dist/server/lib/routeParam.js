function routeParam(c, name) {
  const value = c.req.param(name);
  if (value === void 0) {
    throw new Error(`Missing route param: ${name}`);
  }
  return value;
}
export {
  routeParam
};
