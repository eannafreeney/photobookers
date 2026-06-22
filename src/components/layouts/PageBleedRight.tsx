import { PropsWithChildren } from "hono/jsx";

type PageContentProps = PropsWithChildren<{}>;

const PageBleed = ({ children }: PageContentProps) => {
  return <div class="-mr-4 md:-mr-6">{children}</div>;
};

export default PageBleed;
