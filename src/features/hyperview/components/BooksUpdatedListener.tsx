import { Behavior, View } from "../../../lib/hxml-comps";

type Props = {
  /** URL to refetch into #tab-area (home-content, feed, etc.) */
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
      target="tab-area"
      href={refreshHref}
      hide-during-load="tab-area"
      show-during-load="tab-spinner"
    />
  </View>
);

export default BooksUpdatedListener;
