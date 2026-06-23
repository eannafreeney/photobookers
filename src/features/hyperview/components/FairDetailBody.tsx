import { FC } from "hono/jsx";
import type { BookFair } from "../../../db/schema";
import type { AuthUser } from "../../../../types";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import { formatDate } from "../../../utils";
import FairAttendingCreators, {
  fairAttendingCreatorsStyles,
} from "./FairAttendingCreators";
import FairAttendanceSection, {
  fairAttendanceSectionStyles,
} from "./FairAttendanceSection";
import { fairCardStyles } from "./FairCard";
import ExpandableBio, { expandableBioStyles } from "./spotlight/ExpandableBio";

type Props = {
  fair: BookFair;
  user: AuthUser | null;
  baseUrl: string;
  isAttending: boolean;
};

const FairDetailBody: FC<Props> = ({ fair, user, baseUrl, isAttending }) => {
  const location =
    fair.city && fair.country
      ? `${fair.city}, ${fair.country}`
      : fair.city || fair.country || null;

  return (
    <View style="fair-detail">
      {fair.bannerUrl ? (
        <Image
          source={fair.bannerUrl}
          style="fair-detail-banner"
          resize-mode="cover"
        />
      ) : fair.coverUrl ? (
        <Image
          source={fair.coverUrl}
          style="fair-detail-banner"
          resize-mode="cover"
        />
      ) : null}

      <Text style="fair-detail-title">{fair.name}</Text>

      <View style="fair-detail-meta">
        <View style="fair-detail-pill">
          <Text style="fair-detail-pill-text">
            {formatDate(fair.startDate)} – {formatDate(fair.endDate)}
          </Text>
        </View>
        {location ? (
          <View style="fair-detail-pill">
            <Text style="fair-detail-pill-text">{location}</Text>
          </View>
        ) : null}
        {fair.venue ? (
          <View style="fair-detail-pill">
            <Text style="fair-detail-pill-text">{fair.venue}</Text>
          </View>
        ) : null}
      </View>

      <FairAttendanceSection
        fair={fair}
        user={user}
        baseUrl={baseUrl}
        isAttending={isAttending}
      />

      {fair.description ? (
        <View style="fair-detail-description">
          <ExpandableBio
            id={fair.id}
            bio={fair.description}
            textStyle="fair-detail-description-text"
            maxWords={40}
          />
        </View>
      ) : null}

      <FairAttendingCreators fairId={fair.id} baseUrl={baseUrl} user={user} />

      {fair.website ? (
        <View style="fair-detail-website-btn">
          <Text style="fair-detail-website-label">Visit Fair Website</Text>
          <Behavior href={fair.website} action="new" />
        </View>
      ) : null}
    </View>
  );
};

export default FairDetailBody;

export const fairDetailBodyStyles = () => (
  <>
    {fairCardStyles()}
    {fairAttendanceSectionStyles()}
    {fairAttendingCreatorsStyles()}
    {expandableBioStyles()}
    <Style
      id="fair-detail"
      flexDirection="column"
      gap={16}
      paddingBottom={32}
    />
    <Style id="fair-detail-banner" width="100%" height={220} />
    <Style
      id="fair-detail-title"
      fontFamily="Fraunces-SemiBold"
      fontSize={28}
      color="#191613"
      textAlign="center"
      lineHeight={34}
      marginTop={8}
    />
    <Style
      id="fair-detail-meta"
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="center"
      gap={8}
    />
    <Style
      id="fair-detail-pill"
      backgroundColor="#f2efe8"
      borderRadius={20}
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={14}
      paddingRight={14}
    />
    <Style
      id="fair-detail-pill-text"
      fontSize={13}
      fontWeight="500"
      color="#191613"
    />
    <Style
      id="fair-detail-description"
      backgroundColor="#f2efe8"
      borderRadius={12}
      padding={16}
      marginTop={8}
    />
    <Style
      id="fair-detail-description-text"
      fontSize={15}
      color="#45413a"
      lineHeight={22}
    />
    <Style
      id="fair-detail-website-btn"
      borderWidth={1}
      borderColor="#191613"
      borderRadius={0}
      paddingTop={14}
      paddingBottom={14}
      alignItems="center"
      marginTop={8}
    />
    <Style
      id="fair-detail-website-label"
      fontSize={15}
      fontWeight="600"
      color="#191613"
    />
  </>
);
