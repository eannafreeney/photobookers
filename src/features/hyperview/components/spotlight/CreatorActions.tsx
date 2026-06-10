import React from "react";
import { Behavior, Image, Text, View } from "../../../../lib/hxml-comps";
import { Style } from "../../../../lib/hxml-comps";
import FollowButton from "../FollowButton";
import { Creator } from "../../../../db/schema";
import { xmlText } from "../../../../lib/hxml";
import { aotwPath, potwPath } from "../../../app/spotlightUrls";
import { capitalize } from "../../../../utils";

type Props = {
  creator: Creator;
  baseUrl: string;
  isFollowing: boolean;
  weekStart: Date;
  coverImage: string | null;
};

const CreatorActions = ({
  creator,
  baseUrl,
  isFollowing,
  weekStart,
  coverImage,
}: Props) => {
  const role = capitalize(creator.type);
  const title = `${role} of the Week`;

  const sharePath =
    creator.type === "artist" ? aotwPath(weekStart) : potwPath(weekStart);
  const shareUrl = `${baseUrl}${sharePath}`;

  return (
    <View style="book-actions-row">
      <View style="book-action-cell">
        <FollowButton
          creatorId={creator.id}
          baseUrl={baseUrl}
          isActive={isFollowing}
        />
      </View>
      <View style="book-action-cell">
        <View style="book-action-block">
          <Image
            source={`${baseUrl}/icons/share.png`}
            style="book-action-icon"
            resize-mode="contain"
          />
          <Text style="book-action-label">Share</Text>
          <Behavior
            action="share"
            href={shareUrl}
            share-url={xmlText(shareUrl)}
            share-message={xmlText(
              `Check out ${creator.displayName} on Photobookers`,
            )}
            share-title={xmlText(`${title} — ${creator.displayName}`)}
            {...(coverImage ? { "share-image": xmlText(coverImage) } : {})}
          />
        </View>
      </View>
    </View>
  );
};

export default CreatorActions;

export const creatorActionsStyles = () => (
  <>
    <Style
      id="book-actions-row"
      flexDirection="row"
      alignItems="stretch"
      gap={8}
    />
    <Style id="book-action-cell" flex={1} />
    <Style
      id="book-action-block"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      gap={8}
      paddingTop={12}
      paddingBottom={12}
      paddingLeft={16}
      paddingRight={16}
      borderRadius={10}
      backgroundColor="#ffffff"
      borderWidth={1}
      borderColor="#e8e8e6"
      width="100%"
    >
      <modifier />
    </Style>
    <Style
      id="book-btn"
      width={32}
      height={32}
      borderRadius={16}
      backgroundColor="#e5e7eb"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    />
    <Style id="book-action-icon" width={18} height={18} />
    <Style
      id="book-action-label"
      fontSize={14}
      fontWeight="600"
      color="#111111"
    />
  </>
);
