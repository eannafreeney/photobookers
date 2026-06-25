import { PropsWithChildren } from "hono/jsx";
import { Style, Text, View } from "../../../lib/hxml-comps";
import type { BookStore } from "../../../db/schema";
import StoreCard, { storeCardStyles } from "./StoreCard";

type Props = {
  stores: BookStore[];
  baseUrl: string;
};

const StoresList = ({ stores, baseUrl }: Props) => {
  if (stores.length === 0) return <></>;

  return (
    <>
      {stores.map((store) => (
        <StoreCard
          key={store.id}
          store={store}
          variant="list"
          href={`${baseUrl}/hyperview/stores/${store.slug}`}
        />
      ))}
    </>
  );
};

export default StoresList;

type MessageProps = PropsWithChildren;

export const StoresListMessage = ({ children }: MessageProps) => (
  <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
    {children}
  </view>
);

export const storesListStyles = () => (
  <>
    {storeCardStyles()}
    <Style id="stores-list" flexDirection="column" />
    <Style
      id="stores-empty-message"
      fontSize={14}
      color="#45413a"
      lineHeight={22}
      paddingTop={24}
      paddingLeft={16}
      paddingRight={16}
    />
  </>
);
