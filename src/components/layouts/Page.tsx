import { PropsWithChildren } from "hono/jsx";

type PageProps = PropsWithChildren<{}>;

const Page = ({ children }: PageProps) => {
  return (
    <div class="min-h-screen flex flex-col gap-4 mt-6 mb-12 space-y-6">
      {children}
    </div>
  );
};

export default Page;
