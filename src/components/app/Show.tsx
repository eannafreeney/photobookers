import { FC, PropsWithChildren } from "hono/jsx";

const Show = ({ children, when }: PropsWithChildren<{ when: boolean }>) => {
  if (!when) return <></>;

  return <>{children}</>;
};

export default Show;
