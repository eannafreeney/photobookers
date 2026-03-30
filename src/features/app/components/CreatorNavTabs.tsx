import clsx from "clsx";
import { PropsWithChildren } from "hono/jsx";
import { Book, Creator } from "../../../db/schema";

type Props = {
  creator: Creator;
  currentPath?: string | null;
  showCreatorsTab: boolean;
};

const CreatorNavTabs = ({ currentPath, creator, showCreatorsTab }: Props) => {
  return (
    <nav
      id="creator-nav-tabs"
      class="flex items-center justify-center bg-surface-alt gap-4 mb-2 mt-2"
    >
      <NavLink href={`/creators/${creator.slug}`} currentPath={currentPath}>
        Books
      </NavLink>
      {showCreatorsTab && (
        <NavLink
          href={`/creators/${creator.slug}/creators`}
          currentPath={currentPath}
        >
          {creator.type === "publisher" ? "Artists" : "Publishers"}
        </NavLink>
      )}
      <NavLink
        href={`/creators/${creator.slug}/about`}
        currentPath={currentPath}
      >
        About
      </NavLink>
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

export default CreatorNavTabs;
