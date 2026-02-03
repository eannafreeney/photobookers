import Avatar from "./Avatar";
import { useUser } from "../../contexts/UserContext";
import { getInitialsAvatar } from "../../lib/avatar";

const NavAvatar = () => {
  const user = useUser();
  const isCreator = user?.creator?.id;

  if (!user) {
    return <></>;
  }

  const avatarUrl =
    user?.creator?.coverUrl ??
    getInitialsAvatar(user?.firstName ?? "", user?.lastName ?? "");
    
  const avatarAlt = `${user?.firstName} ${user?.lastName}`;

  return (
    <div class="dropdown dropdown-end">
      <div tabIndex="0" role="button" class="cursor-pointer">
        <Avatar src={avatarUrl} alt={avatarAlt} size="md" />
      </div>
      <ul
        tabIndex="0"
        role="listbox"
        class="menu menu-compact dropdown-content bg-base-100 rounded-box w-52 p-2 shadow text-black"
      >
        {isCreator && (
          <>
            <li>
              <a href="/dashboard/books">Dashboard</a>
            </li>
            <li>
              <a href={`/dashboard/creators/edit/${user?.creator?.id}`}>
                Edit Profile
              </a>
            </li>
          </>
        )}
        <li>
          <a href="/auth/logout">Logout</a>
        </li>
      </ul>
    </div>
  );
};

export default NavAvatar;
