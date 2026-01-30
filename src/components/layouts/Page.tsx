import { PropsWithChildren } from "hono/jsx";

type PageProps = PropsWithChildren<{}>;

const Page = ({ children }: PageProps) => {
  return (
    <div class="px-4 min-h-screen flex flex-col my-4 space-y-4">{children}</div>
  );
};

export default Page;
