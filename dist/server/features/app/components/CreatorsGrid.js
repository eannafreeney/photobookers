import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import CreatorCard from "../../../components/app/CreatorCard.js";
import ScrollReveal from "../../../components/app/ScrollReveal.js";
import SectionTitle from "../../../components/app/SectionTitle.js";
import { capitalize } from "../../../utils.js";
import { getCreatorsByCreatorId } from "../services.js";
import ListNavigation from "./ListNavigation.js";
import SpotlightCreatorLink from "./SpotlightCreatorLink.js";
const CreatorsGrid = async ({
  creatorId,
  creatorType,
  title,
  currentPath,
  currentPage,
  pageParam,
  isMobile = false,
  user = null
}) => {
  const [error, result] = await getCreatorsByCreatorId(
    creatorId,
    creatorType,
    currentPage
  );
  if (error) return /* @__PURE__ */ jsx(Fragment, {});
  const { creators, totalPages, page } = result;
  if (!creators) return /* @__PURE__ */ jsx(Fragment, {});
  if (creators.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  const targetId = `creators-grid-${creatorId}`;
  return /* @__PURE__ */ jsxs("section", { children: [
    title && /* @__PURE__ */ jsx(SectionTitle, { children: title }),
    /* @__PURE__ */ jsx(
      "div",
      {
        id: targetId,
        "x-merge": "append",
        class: isMobile ? void 0 : "grid grid-cols-2 md:grid-cols-4 gap-6",
        children: creators.map((creator) => /* @__PURE__ */ jsx(ScrollReveal, { children: isMobile ? /* @__PURE__ */ jsx(
          SpotlightCreatorLink,
          {
            creator,
            role: capitalize(creator.type)
          }
        ) : /* @__PURE__ */ jsx(
          CreatorCard,
          {
            creator,
            currentPath,
            user,
            showHeader: false
          }
        ) }))
      }
    ),
    /* @__PURE__ */ jsx(
      ListNavigation,
      {
        isInfiniteScroll: true,
        targetId,
        totalPages,
        page,
        currentPath,
        pageParam
      }
    )
  ] });
};
var CreatorsGrid_default = CreatorsGrid;
export {
  CreatorsGrid_default as default
};
