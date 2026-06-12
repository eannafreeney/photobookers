import { PropsWithChildren } from "hono/jsx";
import Head, { type ShareOgMeta } from "./Head";
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
  description?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  user?: AuthUser | null;
  currentPath?: string;
  flash?: Flash | null;
  isPreview?: boolean;
  adminEditHref?: string;
  shareOg?: ShareOgMeta;
}>;

const AppLayout = ({
  title = "photobookers",
  description,
  canonicalUrl,
  noIndex,
  children,
  user,
  currentPath,
  flash,
  isPreview = false,
  adminEditHref,
  shareOg,
}: LayoutProps) => (
  <html lang="en">
    <Head
      title={title}
      description={description}
      canonicalUrl={canonicalUrl}
      noIndex={noIndex ?? currentPath?.startsWith("/dashboard")}
      shareOg={shareOg}
    />
    <body class="bg-surface">
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
          <main class="min-h-60vh mx-auto w-full max-w-[1680px] px-4 md:px-8">
            {children}
          </main>
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
      class="fixed bottom-20 right-5 bg-on-surface-strong text-surface px-4 py-3 shadow-lg opacity-60 cursor-pointer hover:opacity-100 transition-opacity duration-300"
    >
      ↑
    </button>
  );
};
