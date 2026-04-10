import { PropsWithChildren } from "hono/jsx";

type PageContentProps = PropsWithChildren<{}>;

const PageBleed = ({ children }: PageContentProps) => {
  return <div class="-mx-4">{children}</div>;
};

export default PageBleed;
