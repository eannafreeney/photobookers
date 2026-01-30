import { useUser } from "../../contexts/UserContext";

const NavLinks = () => {
  const user = useUser();

  return (
    <ul class="menu menu-horizontal">
      {!user && (
        <>
          <NavLink href="/auth/login">Login</NavLink>
          <NavLink href="/auth/accounts">Register</NavLink>
        </>
      )}
    </ul>
  );
};

export default NavLinks;

type NavLinkProps = {
  href: string;
  children: string;
  currentPath?: string | null;
};

const NavLink = ({
  href,
  children,
  currentPath,
}: NavLinkProps): JSX.Element => {
  const isActive = currentPath === href;
  return (
    <li>
      <a
        href={href}
        class={`link link-hover ${isActive ? "link-primary" : ""}`}
      >
        {children}
      </a>
    </li>
  );
};
