import { PropsWithChildren } from "hono/jsx";

type PageProps = PropsWithChildren<{}>;

const Page = ({ children }: PageProps) => {
  return <div class="min-h-screen flex flex-col gap-6 pt-6 mb-6">{children}</div>;
};

export default Page;
