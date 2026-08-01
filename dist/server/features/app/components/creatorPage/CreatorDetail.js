import { jsx } from "hono/jsx/jsx-runtime";
import CreatorDetailMobile from "./CreatorDetailMobile.js";
import CreatorDetailDesktop from "./CreatorDetailDesktop.js";
const CreatorDetail = ({
  creator,
  user,
  currentPath,
  result,
  creatorsCurrentPage,
  isMobile,
  postCount,
  upcomingFairs
}) => {
  const showCreatorsTab = result.relatedCreators.creators.length > 0;
  const showFairsTab = upcomingFairs.length > 0;
  const showPostsTab = postCount > 0;
  const isOwner = user?.creator?.id === creator.id;
  return isMobile ? /* @__PURE__ */ jsx(
    CreatorDetailMobile,
    {
      creator,
      user,
      currentPath,
      showCreatorsTab,
      showFairsTab,
      showPostsTab,
      result,
      creatorsCurrentPage,
      upcomingFairs,
      isOwner,
      postCount
    }
  ) : /* @__PURE__ */ jsx(
    CreatorDetailDesktop,
    {
      creator,
      user,
      currentPath,
      showCreatorsTab,
      showFairsTab,
      showPostsTab,
      result,
      creatorsCurrentPage,
      upcomingFairs,
      isOwner,
      postCount
    }
  );
};
var CreatorDetail_default = CreatorDetail;
export {
  CreatorDetail_default as default
};
