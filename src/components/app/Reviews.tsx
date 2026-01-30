const Reviews = ({ reviews, bookId }: { reviews: any[]; bookId: string }) => {
  return (
    <div>
      <h2>Reviews</h2>
      {reviews.map((review, idx) => (
        <div key={review.id}>
          <h3>Review {idx + 1}</h3>
          <h3>{review.title}</h3>
          <p>{review.content}</p>
        </div>
      ))}
      <form action={`/books/${bookId}/reviews`} method="POST">
        <textarea
          name="review"
          id="review"
          placeholder="Write a review"
        ></textarea>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
export default Reviews;
