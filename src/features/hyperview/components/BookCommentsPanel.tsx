import { FC } from "hono/jsx";
import type { AuthUser } from "../../../../types";
import { getBookComments, getDisplayName } from "../../app/services";
import {
  Behavior,
  Form,
  Image,
  Style,
  Text,
  TextField,
  View,
} from "../../../lib/hxml-comps";
import { formatDate } from "../../../utils";
import SignInPrompt from "./SignInPrompt";

/** Element id for `replace` after submit — must not match any `<style id="…">`. */
export const BOOK_COMMENTS_PANEL_ID = "book-comments-panel";

type Comment = NonNullable<
  Awaited<ReturnType<typeof getBookComments>>[1]
>[number];

type Props = {
  bookId: string;
  baseUrl: string;
  user: AuthUser | null;
  comments: Comment[];
  error?: string | null;
};

const ProfilePhotoForm = ({
  userId,
  bookId,
  baseUrl,
}: {
  userId: string;
  bookId: string;
  baseUrl: string;
}) => (
  <View style="profile-photo-form">
    <Text style="comment-form-hint">
      Add a profile photo from your library to comment.
    </Text>
    <View style="comment-form-submit">
      <Text style="comment-form-submit-label">Choose Photo</Text>
      <Behavior
        action="pick-profile-photo"
        href={`${baseUrl}/api/users/${userId}/profile-image?bookId=${encodeURIComponent(bookId)}`}
        target={BOOK_COMMENTS_PANEL_ID}
      />
    </View>
  </View>
);

type BookCommentFormProps = {
  bookId: string;
  baseUrl: string;
};

const BookCommentForm = ({ bookId, baseUrl }: BookCommentFormProps) => (
  <Form id={`comment-form-${bookId}`}>
    <TextField
      style="comment-form-input"
      name="body"
      placeholder="Share what you loved about this book…"
    />
    <View style="comment-form-submit">
      <Text style="comment-form-submit-label">Add Comment</Text>
      <Behavior
        verb="post"
        action="replace"
        target={BOOK_COMMENTS_PANEL_ID}
        href={`${baseUrl}/api/books/${bookId}/comments`}
      />
    </View>
  </Form>
);

const BookCommentsPanel: FC<Props> = ({
  bookId,
  baseUrl,
  user,
  comments,
  error,
}) => {
  const hasUserCommented =
    !!user?.id && comments.some((comment) => comment.userId === user.id);
  const hasProfilePic = !!(user?.creator?.coverUrl || user?.profileImageUrl);

  return (
    <View id={BOOK_COMMENTS_PANEL_ID} xmlns="https://hyperview.org/hyperview">
      <Text style="comments-heading">What did you love about this book?</Text>

      {error ? <Text style="comment-form-error">{error}</Text> : null}

      {!user ? (
        <SignInPrompt
          variant="fragment"
          baseUrl={baseUrl}
          hint="Log into comment on this book."
        />
      ) : !hasProfilePic && user.id ? (
        <ProfilePhotoForm userId={user.id} bookId={bookId} baseUrl={baseUrl} />
      ) : !hasUserCommented ? (
        <BookCommentForm bookId={bookId} baseUrl={baseUrl} />
      ) : null}

      {comments.length === 0 ? (
        <Text style="comments-empty">
          No comments yet. Be the first to comment!
        </Text>
      ) : (
        <>
          {comments.map((comment) => {
            const creator = comment.user?.creators?.[0] ?? null;
            const authorName = creator
              ? creator.displayName
              : getDisplayName(comment.user);
            const authorImage =
              creator?.coverUrl ?? comment.user?.profileImageUrl;

            return (
              <View key={comment.id} style="comment-item">
                <View style="comment-author-row">
                  {authorImage ? (
                    <Image
                      source={authorImage}
                      style="comment-avatar"
                      resize-mode="cover"
                    />
                  ) : (
                    <View style="comment-avatar-placeholder" />
                  )}
                  <View style="comment-author-info">
                    <Text style="comment-username">{authorName}</Text>
                    {comment.createdAt && (
                      <Text style="comment-date">
                        {formatDate(comment.createdAt)}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style="comment-body">{comment.body}</Text>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
};

export default BookCommentsPanel;

export const bookCommentsPanelStyles = () => (
  <>
    <Style
      id="comment-form-input"
      borderWidth={1}
      borderColor="#e4e0d5"
      borderRadius={0}
      paddingTop={12}
      paddingBottom={12}
      paddingLeft={12}
      paddingRight={12}
      fontSize={15}
      backgroundColor="#fbfaf7"
      color="#191613"
      minHeight={96}
      marginBottom={12}
    />
    <Style
      id="comment-form-submit"
      backgroundColor="#191613"
      borderRadius={0}
      paddingTop={12}
      paddingBottom={12}
      alignItems="center"
      marginBottom={16}
    />
    <Style
      id="comment-form-submit-label"
      color="#fbfaf7"
      fontWeight="600"
      fontSize={15}
    />
    <Style
      id="comment-form-hint"
      fontSize={14}
      color="#45413a"
      marginBottom={16}
    />
    <Style
      id="comment-form-error"
      fontSize={14}
      color="#b91c1c"
      marginBottom={12}
    />
    <Style id="comment-form-signin" marginBottom={16} />
    <Style id="profile-photo-form" marginBottom={16} />
  </>
);
