import { Behavior, View } from "../../../lib/hxml-comps";

import {
  FEATURED_TAB_BODY_ID,
  FEATURED_TAB_SPINNER_ID,
} from "./featuredTabIds";

type Props = {
  /** URL to refetch into the featured tab body (home-content, feed, etc.) */
  refreshHref: string;
};

/**
 * Hidden listener: when any screen dispatches books-updated,
 * refetch this tab’s content so BookCards get fresh like flags.
 */
const BooksUpdatedListener = ({ refreshHref }: Props) => (
  <View>
    <Behavior
      trigger="on-event"
      event-name="books:updated"
      verb="get"
      action="replace-inner"
      target={FEATURED_TAB_BODY_ID}
      href={refreshHref}
      hide-during-load={FEATURED_TAB_BODY_ID}
      show-during-load={FEATURED_TAB_SPINNER_ID}
    />
  </View>
);

export default BooksUpdatedListener;
