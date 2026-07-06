function getIsMobile(userAgent) {
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(
    userAgent
  );
  if (isMobile) {
    return true;
  }
  return false;
}
export {
  getIsMobile
};
