type Props = {
  baseUrl: string;
  page: number;
  totalPages: number;
  targetId: string;
};

export const Pagination = ({ baseUrl, page, totalPages, targetId }: Props) => {
  if (totalPages <= 1) return null;

  return (
    <nav
      class="flex items-center justify-center gap-2"
      x-init
      x-intersect={`$ajax('${baseUrl}?page=${page + 1}', { target: 'pagination ${targetId}' })`}
    >
      {page > 1 && <a href={`${baseUrl}?page=${page - 1}`}>← Previous</a>}

      {Array.from({ length: totalPages }).map((_, i) => {
        const p = i + 1;
        return p === page ? (
          <strong>{p}</strong>
        ) : (
          <a href={`${baseUrl}?page=${p}`}>{p}</a>
        );
      })}

      {page < totalPages && <a href={`${baseUrl}?page=${page + 1}`}>Next →</a>}
    </nav>
  );
};
