const getIsHyperview = (c) => c.req.path.startsWith("/hyperview") || (c.req.header("accept") ?? "").includes("application/vnd.hyperview");
export {
  getIsHyperview
};
