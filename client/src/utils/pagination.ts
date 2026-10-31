/**
 * Generates an array of page numbers with ellipsis ('...') for pagination controls.
 */
export function getPageNumbers(
  page: number,
  totalPages: number,
  delta = 2
): (number | string)[] {
  const pages: (number | string)[] = [];
  const start = Math.max(1, page - delta);
  const end = Math.min(totalPages, page + delta);

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('...');
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  return pages;
}
