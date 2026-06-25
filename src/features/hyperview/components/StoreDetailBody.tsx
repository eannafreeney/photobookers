import { FC } from "hono/jsx";
import type { BookStore } from "../../../db/schema";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";

type Props = {
  store: BookStore;
};

const formatLocation = (store: BookStore) =>
  [store.city, store.country].filter(Boolean).join(", ");

const StoreDetailBody: FC<Props> = ({ store }) => {
  const location = formatLocation(store);

  return (
    <View style="store-detail">
      {store.coverUrl ? (
        <Image
          source={store.coverUrl}
          style="store-detail-banner"
          resize-mode="cover"
        />
      ) : null}

      <Text style="store-detail-title">{store.name}</Text>

      <View style="store-detail-meta">
        {location ? (
          <View style="store-detail-pill">
            <Text style="store-detail-pill-text">{location}</Text>
          </View>
        ) : null}
        {store.address ? (
          <View style="store-detail-pill">
            <Text style="store-detail-pill-text">{store.address}</Text>
          </View>
        ) : null}
      </View>

      {store.description ? (
        <View style="store-detail-description">
          <Text style="store-detail-description-text">{store.description}</Text>
        </View>
      ) : null}

      {store.website ? (
        <View style="store-detail-website-btn">
          <Text style="store-detail-website-label">Visit Bookstore Website</Text>
          <Behavior href={store.website} action="new" />
        </View>
      ) : null}
    </View>
  );
};

export default StoreDetailBody;

export const storeDetailBodyStyles = () => (
  <>
    <Style
      id="store-detail"
      flexDirection="column"
      gap={16}
      paddingBottom={32}
    />
    <Style id="store-detail-banner" width="100%" height={220} />
    <Style
      id="store-detail-title"
      fontFamily="Fraunces-SemiBold"
      fontSize={28}
      color="#191613"
      textAlign="center"
      lineHeight={34}
      marginTop={8}
    />
    <Style
      id="store-detail-meta"
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="center"
      gap={8}
    />
    <Style
      id="store-detail-pill"
      backgroundColor="#f2efe8"
      borderRadius={20}
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={14}
      paddingRight={14}
    />
    <Style
      id="store-detail-pill-text"
      fontSize={13}
      fontWeight="500"
      color="#191613"
    />
    <Style
      id="store-detail-description"
      backgroundColor="#f2efe8"
      borderRadius={12}
      padding={16}
      marginTop={8}
    />
    <Style
      id="store-detail-description-text"
      fontSize={15}
      color="#45413a"
      lineHeight={22}
    />
    <Style
      id="store-detail-website-btn"
      borderWidth={1}
      borderColor="#191613"
      borderRadius={0}
      paddingTop={14}
      paddingBottom={14}
      alignItems="center"
      marginTop={8}
    />
    <Style
      id="store-detail-website-label"
      fontSize={15}
      fontWeight="600"
      color="#191613"
    />
  </>
);
