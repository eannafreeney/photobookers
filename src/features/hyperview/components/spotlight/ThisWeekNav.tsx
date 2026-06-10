import { FC } from "hono/jsx";
import { Style, View } from "../../../../lib/hxml-comps";
import { toWeekStart, toWeekString } from "../../../../lib/utils";
import SecondaryButtonLink, {
  secondaryButtonLinkStyles,
} from "../SecondaryButtonLink";

type Props = {
  baseUrl: string;
  weekStart: Date;
};

const ThisWeekNav: FC<Props> = ({ baseUrl, weekStart }) => {
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7);
  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);
  const canGoNext =
    nextWeekStart.getTime() <= toWeekStart(new Date()).getTime();

  return (
    <View style="spotlight-week-nav">
      <SecondaryButtonLink
        label="← Previous week"
        href={`${baseUrl}/hyperview/this-week?week=${toWeekString(prevWeekStart)}`}
      />
      {canGoNext ? (
        <SecondaryButtonLink
          label="Next week →"
          href={`${baseUrl}/hyperview/this-week?week=${toWeekString(nextWeekStart)}`}
        />
      ) : (
        <SecondaryButtonLink
          isDisabled
          label="Next week →"
          href={`${baseUrl}/hyperview/this-week?week=${toWeekString(nextWeekStart)}`}
        />
      )}
    </View>
  );
};

export default ThisWeekNav;

export const thisWeekNavStyles = () => (
  <>
    <Style
      id="spotlight-week-nav"
      flexDirection="row"
      justifyContent="space-between"
      gap={12}
      paddingTop={16}
      marginTop={8}
      paddingBottom={16}
      borderTopWidth={1}
      borderTopColor="#e5e5e5"
    />
    {secondaryButtonLinkStyles()}
  </>
);
