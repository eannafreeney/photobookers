/** @jsxImportSource react */

import { BookColumn } from "./BookColumn";
import { FeatureRow } from "./FeatureRow";
import type { BookCardBook } from "./types";

/** Full-width book card (own section). */
export const BookFeatureCard = ({ book }: { book: BookCardBook }) => (
  <FeatureRow>
    <BookColumn book={book} />
  </FeatureRow>
);
