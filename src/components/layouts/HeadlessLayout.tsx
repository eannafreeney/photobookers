import { PropsWithChildren } from "hono/jsx";
import Head from "./Head";
import BrandLogo from "../app/BrandLogo";
import Alert from "../app/Alert";
import { Flash } from "../../../types";
import Footer from "../app/Footer";
import ToastContainer from "../app/ToastContainer";
import { isStaging } from "../../lib/isStaging";

type LayoutProps = PropsWithChildren<{
  title: string;
  description?: string;
  flash?: Flash | null;
  noIndex?: boolean;
  showNavbar?: boolean;
  showFooter?: boolean;
}>;

const HeadlessLayout = ({
  title,
  description,
  children,
  flash,
  noIndex = true,
  showNavbar = true,
  showFooter = true,
}: LayoutProps) => (
  <html lang="en">
    <Head title={title} description={description} noIndex={noIndex} />
    <body class="bg-surface">
      {flash && <Alert type={flash.type} message={flash.message} />}
      <ToastContainer />
      {showNavbar && <Navbar />}
      <main class="container mx-auto min-h-screen px-4">{children}</main>
      {showFooter && <Footer />}
    </body>
  </html>
);

export default HeadlessLayout;

const Navbar = () => {
  const staging = isStaging();
  return (
    <nav
      class={
        staging
          ? "flex items-center justify-between gap-4 border-b border-amber-300 bg-amber-50 px-6 py-4"
          : "flex items-center justify-between gap-4 border-b border-on-surface-strong bg-surface px-6 py-4"
      }
    >
      <BrandLogo />
    </nav>
  );
};
