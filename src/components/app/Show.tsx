import { FC, PropsWithChildren } from "hono/jsx";

const Show = ({ children, when }: PropsWithChildren<{ when: boolean }>) => {
  if (!when) return <></>;

  return children as ReturnType<FC>;
};

export default Show;
