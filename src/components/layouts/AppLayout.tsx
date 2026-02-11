import { PropsWithChildren } from "hono/jsx";
import Head from "./Head";
import { UserProvider } from "../../contexts/UserContext";
import { AuthUser, Flash } from "../../../types";
import Navbar from "./Navbar";
import Footer from "../app/Footer";
import Alert from "../app/Alert";
import PreviewBanner from "../app/PreviewBanner";

type LayoutProps = PropsWithChildren<{
  title: string;
  user?: AuthUser | null;
  currentPath?: string | null;
  flash?: Flash | null;
  isPreview?: boolean;
}>;

const AppLayout = ({
  title = "photobookers",
  children,
  user,
  currentPath,
  flash,
  isPreview,
}: LayoutProps) => (
  <html lang="en">
    <Head title={title} />
    <body class="bg-surface-alt">
      <UserProvider user={user}>
        {isPreview && <PreviewBanner />}
        <Navbar currentPath={currentPath} />
        <main class="container mx-auto min-h-screen px-4">{children}</main>
        <Footer />
      </UserProvider>
      <div id="modal-root"></div>
      {flash && <Alert type={flash.type} message={flash.message} />}
      <div id="toast"></div>
      <div x-sync id="server_events"></div>
      <script
        src="//instant.page/5.2.0"
        type="module"
        integrity="sha384-jnZyxPjiipYXnSU0ygqeac2q7CVYMbh84q0uHVRRxEtvFPiQYbXWUorga2aqZJ0z"
      ></script>
    </body>
  </html>
);

export default AppLayout;
