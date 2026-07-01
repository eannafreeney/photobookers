import { PropsWithChildren } from "hono/jsx";

type PageProps = PropsWithChildren<{}>;

const Page = ({ children }: PageProps) => {
  return <div class="min-h-screen flex flex-col gap-6 my-6">{children}</div>;
};

export default Page;
