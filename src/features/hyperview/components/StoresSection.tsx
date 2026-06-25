import { ScrollView, Style, View } from "../../../lib/hxml-comps";
import { getPublishedStores } from "../../app/stores/services";
import SectionHeader from "./SectionHeader";
import StoreCard, { storeCardStyles } from "./StoreCard";

const FEATURED_STORES_LIMIT = 5;

type Props = {
  baseUrl: string;
};

const StoresSection = async ({ baseUrl }: Props) => {
  const [error, result] = await getPublishedStores({
    page: 1,
    limit: FEATURED_STORES_LIMIT,
  });

  if (error) return <></>;

  const { stores } = result;
  if (stores.length === 0) return <></>;

  return (
    <View style="stores-section">
      <SectionHeader
        title="Bookstores"
        viewAllHref={`${baseUrl}/hyperview/stores`}
      />
      <ScrollView
        style="stores-scroll"
        horizontal="true"
        shows-scroll-indicator="false"
      >
        {stores.map((store) => (
          <StoreCard
            store={store}
            href={`${baseUrl}/hyperview/stores/${store.slug}`}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default StoresSection;

export const storesSectionStyles = () => (
  <>
    {storeCardStyles()}
    <Style
      id="stores-section"
      flexDirection="column"
      gap={12}
      marginBottom={12}
    />
    <Style id="stores-scroll" flexDirection="row" />
  </>
);
