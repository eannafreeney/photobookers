import { Behavior, Style, Text, View } from "../../../lib/hxml-comps";

type Props = {
  purchaseHref: string;
};

const BookPurchaseButton = ({ purchaseHref }: Props) => {
  return (
    <View style="book-purchase-wrap">
      <View style="purchase-btn">
        <Behavior action="deep-link" href={purchaseHref} />
        <Text style="purchase-label">See more</Text>
      </View>
    </View>
  );
};

export default BookPurchaseButton;

export const bookPurchaseButtonStyles = () => (
  <>
    <Style id="book-purchase-wrap" marginTop={4} marginBottom={16} />
    <Style
      id="purchase-btn"
      paddingTop={10}
      paddingBottom={10}
      paddingLeft={20}
      paddingRight={20}
      borderRadius={0}
      backgroundColor="#191613"
      alignItems="center"
    />
    <Style id="purchase-label" fontSize={14} fontWeight="600" color="#fbfaf7" />
  </>
);
