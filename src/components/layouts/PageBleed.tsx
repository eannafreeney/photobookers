import { PropsWithChildren } from "hono/jsx";

type PageContentProps = PropsWithChildren<{}>;

const PageBleed = ({ children }: PageContentProps) => {
  return <div class="-mx-4 md:-mx-6">{children}</div>;
};

export default PageBleed;
