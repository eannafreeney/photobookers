import clsx from "clsx";
import { PropsWithChildren } from "hono/jsx";
import { Book } from "../../../db/schema";
import Show from "../../../components/app/Show";

type Props = {
  bookSlug: string;
  currentPath?: string | null;
  hasPublisher?: boolean;
};

const BookNavTabs = ({
  currentPath,
  bookSlug,
  hasPublisher = false,
}: Props) => {
  return (
    <nav
      id="creator-nav-tabs"
      class="flex items-center justify-center bg-surface-alt gap-2 mb-2 mt-2"
    >
      <NavLink href={`/books/${bookSlug}`} currentPath={currentPath}>
        Book
      </NavLink>
      <NavLink href={`/books/${bookSlug}/comments`} currentPath={currentPath}>
        Comments
      </NavLink>
      <NavLink href={`/books/${bookSlug}/artist`} currentPath={currentPath}>
        Artist
      </NavLink>
      <Show when={hasPublisher}>
        <NavLink
          href={`/books/${bookSlug}/publisher`}
          currentPath={currentPath}
        >
          Publisher
        </NavLink>
      </Show>
    </nav>
  );
};

type NavLinkProps = PropsWithChildren<{
  href: string;
  currentPath?: string | null;
}>;

const NavLink = ({ href, children, currentPath }: NavLinkProps) => {
  const isActive = currentPath === href;

  return (
    <li class="list-none">
      <a
        href={href}
        prefetch="intent"
        class={clsx(
          "flex items-center gap-2 border-b-2 border-transparent px-4 py-1 text-sm",
          isActive
            ? "font-bold text-primary border-primary border-b-2 border-b-primary"
            : "text-on-surface font-medium hover:border-b-outline-strong hover:text-on-surface-strong",
        )}
      >
        {children}
      </a>
    </li>
  );
};

export default BookNavTabs;
