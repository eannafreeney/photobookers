import { FC } from "hono/jsx";
import { Image, ScrollView, Style, Text, View } from "../../../lib/hxml-comps";
import { getPublishedStores } from "../../app/stores/services";
import SectionHeader from "./SectionHeader";

const FEATURED_STORES_LIMIT = 5;

type Props = {
  baseUrl: string;
};

const formatLocation = (store: { city?: string | null; country?: string | null }) =>
  [store.city, store.country].filter(Boolean).join(", ");

const StoresSection: FC<Props> = async (_props) => {
  const [error, result] = await getPublishedStores({
    page: 1,
    limit: FEATURED_STORES_LIMIT,
  });

  if (error) return <></>;

  const { stores } = result;
  if (stores.length === 0) return <></>;

  return (
    <View style="stores-section">
      <SectionHeader title="Bookstores" />
      <ScrollView
        style="stores-scroll"
        horizontal="true"
        shows-scroll-indicator="false"
      >
        {stores.map((store) => {
          const location = formatLocation(store);

          return (
            <View key={store.id} style="store-card">
              {store.coverUrl ? (
                <Image
                  source={store.coverUrl}
                  style="store-card-image"
                  resize-mode="cover"
                />
              ) : (
                <View style="store-card-image" />
              )}
              <View style="store-card-overlay">
                <Text style="store-card-eyebrow">BOOKSTORE</Text>
                <Text style="store-card-name">{store.name}</Text>
                {location ? (
                  <Text style="store-card-location">{location}</Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default StoresSection;

export const storesSectionStyles = () => (
  <>
    <Style
      id="stores-section"
      flexDirection="column"
      gap={12}
      marginBottom={12}
    />
    <Style id="stores-scroll" flexDirection="row" />
    <Style
      id="store-card"
      width={220}
      height={256}
      overflow="hidden"
      marginRight={12}
      backgroundColor="#e4e0d5"
    />
    <Style
      id="store-card-image"
      width={220}
      height={256}
      backgroundColor="#e4e0d5"
    />
    <Style
      id="store-card-overlay"
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.45)"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding={16}
      gap={4}
    />
    <Style
      id="store-card-eyebrow"
      fontSize={10}
      fontWeight="600"
      letterSpacing={2}
      color="rgba(255,255,255,0.75)"
    />
    <Style
      id="store-card-name"
      fontFamily="Fraunces-Medium"
      fontSize={22}
      color="#fbfaf7"
      textAlign="center"
    />
    <Style
      id="store-card-location"
      fontSize={11}
      color="rgba(255,255,255,0.7)"
      textAlign="center"
    />
  </>
);
