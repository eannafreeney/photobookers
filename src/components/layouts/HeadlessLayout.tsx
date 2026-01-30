import { PropsWithChildren } from "hono/jsx";
import Head from "./Head";
import BrandLogo from "../app/BrandLogo";

type LayoutProps = PropsWithChildren<{
  title: string;
}>;

const HeadlessLayout = ({ title, children }: LayoutProps) => (
  <html lang="en">
    <Head title={title} />
    <body class="bg-surface">
      <div id="toast"></div>
      <Navbar />
      <main class="container mx-auto min-h-screen px-4">{children}</main>
    </body>
  </html>
);

export default HeadlessLayout;

const Navbar = () => (
  <nav class="flex items-center justify-between bg-surface-alt border-b border-outline gap-4 px-6 py-4">
    <BrandLogo />
  </nav>
);
