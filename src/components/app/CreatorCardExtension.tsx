import BookCard from "./BookCard";

const CreatorCardExtension = ({ books }: { books: any }) => {
  return (
    <div>
      <h2>Books</h2>
      <ul>
        {books.map((book: any) => (
          <BookCard book={book} />
        ))}
      </ul>
    </div>
  );
};
export default CreatorCardExtension;
