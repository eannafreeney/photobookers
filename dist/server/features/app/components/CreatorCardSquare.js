import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Card from "../../../components/app/Card.js";
import Link from "../../../components/app/Link.js";
import VerifiedCreator from "../../../components/app/VerifiedCreator.js";
import FollowButton from "../../api/components/FollowButton.js";
import { useUser } from "../../../contexts/UserContext.js";
const CreatorCardSquare = async ({ creator }) => {
  const user = useUser();
  return /* @__PURE__ */ jsxs(Card, { className: "shrink-0", children: [
    /* @__PURE__ */ jsx(
      Card.Image,
      {
        src: creator.coverUrl ?? "",
        alt: creator.displayName ?? "",
        href: `/creators/${creator.slug}`,
        aspectSquare: true,
        objectCover: true
      }
    ),
    /* @__PURE__ */ jsx(Card.Body, { children: /* @__PURE__ */ jsxs("div", { class: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Link, { href: `/creators/${creator.slug}`, children: /* @__PURE__ */ jsx(Card.Title, { children: creator.displayName }) }),
        /* @__PURE__ */ jsx(
          VerifiedCreator,
          {
            creatorStatus: creator.status ?? "stub",
            size: "xs"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        FollowButton,
        {
          creator,
          user,
          isCircleButton: true,
          shouldRefreshFollowedCreators: true
        }
      )
    ] }) })
  ] });
};
var CreatorCardSquare_default = CreatorCardSquare;
export {
  CreatorCardSquare_default as default
};
