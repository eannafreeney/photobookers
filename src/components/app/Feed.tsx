import { AuthUser } from "../../../types";

type FeedProps = {
  user?: AuthUser;
};

const Feed = ({ user }: FeedProps) => {
  return <div>THIS IS THE FEED FOR {user?.name}</div>;
};
export default Feed;
