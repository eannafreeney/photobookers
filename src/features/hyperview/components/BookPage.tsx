import { Behavior, Image, Style, View } from "../../../lib/hxml-comps";
import { ScrollView } from "../../../lib/hxml-comps";
import { Text } from "../../../lib/hxml-comps";
import { BookWithGalleryImages } from "../../app/types";
import { AuthUser } from "../../../types";
import { HyperviewBookLikeInner } from "./BookCard";

type Props = {
  galleryImages: string[];
  book: BookWithGalleryImages;
  baseUrl: string;
  user: AuthUser;
  isLiked: boolean;
  isWishlisted: boolean;
  isCollected: boolean;
};

const BookPage = ({
  galleryImages,
  book,
  baseUrl,
  user,
  isLiked,
  isWishlisted,
  isCollected,
}: Props) => {
  const urls = galleryImages.filter((url): url is string => Boolean(url));
  if (urls.length === 0) return null;

  return (
    <view xmlns="https://hyperview.org/hyperview">
      <View style="gallery-stack">
        <View id="gallery-hero-slot" style="gallery-hero-wrap">
          <Image
            source={urls[0]!}
            style="gallery-hero-image"
            resize-mode="cover"
          />
        </View>
        <View hide="true">
          {urls.map((url, i) => (
            <View key={`frag-${i}`} id={`gallery-hero-frag-${i}`}>
              <Image
                source={url}
                style="gallery-hero-image"
                resize-mode="cover"
              />
            </View>
          ))}
        </View>
        <ScrollView style="gallery-thumbs" horizontal="true">
          {urls.map((url, i) => (
            <View key={`thumb-${i}`} style="gallery-thumb-cell">
              <Behavior
                trigger="press"
                action="replace-inner"
                target="gallery-hero-slot"
                href={`#gallery-hero-frag-${i}`}
              />
              <Image
                source={url}
                style="gallery-thumb-image"
                resize-mode="cover"
              />
            </View>
          ))}
        </ScrollView>
      </View>
      <View style="book-actions-row">
        <View style="book-action-cell">
          <View id={`book-like-${book.id}`} style="book-action-inner">
            <HyperviewBookLikeInner
              bookId={book.id}
              baseUrl={baseUrl}
              isLiked={isLiked}
            />
          </View>
        </View>
        <View style="book-action-cell">
          <View style="book-action-inner">
            <Behavior
              trigger="press"
              verb="post"
              action="replace-inner"
              target={`book-wishlist-${book.id}`}
              href={`${baseUrl}/api/books/${book.id}/wishlist`}
            />
            <Text style="book-action-label">{isWishlisted ? "★" : "☆"}</Text>
          </View>
          <View id={`book-wishlist-${book.id}`} hide="true" />
        </View>
        <View style="book-action-cell">
          <View style="book-action-inner">
            <Behavior
              trigger="press"
              verb="post"
              action="replace-inner"
              target={`book-collect-${book.id}`}
              href={`${baseUrl}/api/books/${book.id}/collect`}
            />
            <Text style="book-action-label">{isCollected ? "✓" : "+"}</Text>
          </View>
          <View id={`book-collect-${book.id}`} hide="true" />
        </View>
        <View style="book-action-cell">
          <View style="book-action-inner">
            <Behavior
              trigger="press"
              action="copy-to-clipboard"
              copy-to-clipboard-value={`${baseUrl}/books/${book.slug}`}
            />
            <Text style="book-action-label">Share</Text>
          </View>
        </View>
      </View>

      <Text style="title">{book.title}</Text>
      <Text style="subtitle">{book.artist?.displayName}</Text>
      <Text style="description">{book.description}</Text>
    </view>
  );
};

export default BookPage;

export const bookPageStyles = () => (
  <>
    <Style id="gallery-stack" marginLeft={-16} marginRight={-16} />
    <Style
      id="gallery-hero-wrap"
      width="100%"
      height={320}
      backgroundColor="#f0f0ee"
    />
    <Style id="gallery-hero-image" width="100%" height={320} />
    <Style
      id="gallery-thumbs"
      flexDirection="row"
      height={76}
      marginTop={12}
      paddingLeft={4}
      paddingRight={4}
    />
    <Style
      id="gallery-thumb-cell"
      width={64}
      height={64}
      marginRight={8}
      alignItems="center"
      justifyContent="center"
    />
    <Style
      id="gallery-thumb-image"
      width={56}
      height={56}
      borderRadius={6}
      borderWidth={1}
      borderColor="#e5e5e5"
      opacity={0.85}
    />
    <Style
      id="gallery-thumb-selected"
      width={56}
      height={56}
      borderRadius={6}
      borderWidth={2}
      borderColor="#111111"
      opacity={1}
    />
    <Style
      id="book-actions-row"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      marginTop={16}
      marginBottom={8}
      paddingLeft={4}
      paddingRight={4}
    />
    <Style id="book-action-cell" flex={1} alignItems="center" />
    <Style
      id="book-action-inner"
      paddingTop={10}
      paddingBottom={10}
      alignItems="center"
      justifyContent="center"
      borderRadius={8}
      backgroundColor="#ffffff"
      borderWidth={1}
      borderColor="#e8e8e6"
      width="100%"
      marginLeft={4}
      marginRight={4}
    />
    <Style
      id="book-action-label"
      fontSize={13}
      fontWeight="600"
      color="#111111"
    />
  </>
);
