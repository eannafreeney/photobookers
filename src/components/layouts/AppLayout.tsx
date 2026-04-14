import { PropsWithChildren } from "hono/jsx";
import Head from "./Head";
import { UserProvider } from "../../contexts/UserContext";
import { AuthUser, Flash } from "../../../types";
import Navbar from "./Navbar";
import Footer from "../app/Footer";
import Alert from "../app/Alert";
import PreviewBanner from "../app/PreviewBanner";
import Dock from "./Dock";
import ToastContainer from "../app/ToastContainer";
import ActivityStream from "../app/ActivityStream";
import { fadeTransition } from "../../lib/transitions";

type LayoutProps = PropsWithChildren<{
  title: string;
  user?: AuthUser | null;
  currentPath?: string;
  flash?: Flash | null;
  isPreview?: boolean;
  adminEditHref?: string;
}>;

const AppLayout = ({
  title = "photobookers",
  children,
  user,
  currentPath,
  flash,
  isPreview = false,
  adminEditHref,
}: LayoutProps) => (
  <html lang="en">
    <Head title={title} />
    <body class="bg-surface-alt">
      <UserProvider user={user}>
        {isPreview && <PreviewBanner />}
        <Navbar
          currentPath={currentPath}
          user={user}
          adminEditHref={adminEditHref}
        />
        <div
          class="pb-0"
          x-data="{
            show: false,
            init() {
                window.addEventListener('scroll', () => {
                    this.show = window.scrollY > 300
                })
            }
        }"
        >
          <main class="min-h-60vh lg:mx-4">{children}</main>
          <Footer />
          <ScrollToTopButton />
          <Dock currentPath={currentPath} />
        </div>
      </UserProvider>
      <div id="modal-root"></div>
      {flash && <Alert type={flash.type} message={flash.message} />}
      <ToastContainer />
      <ActivityStream currentUserId={user?.id ?? undefined} />
      <div x-sync id="server_events"></div>
    </body>
  </html>
);

export default AppLayout;

const ScrollToTopButton = () => {
  return (
    <button
      x-show="show"
      {...fadeTransition}
      x-on:click="window.scrollTo({ top: 0, behavior: 'smooth' })"
      class="fixed bottom-20 right-5 bg-black text-white px-4 py-3 rounded shadow-lg opacity-60 cursor-pointer hover:opacity-100 transition-opacity duration-300"
    >
      ↑
    </button>
  );
};
