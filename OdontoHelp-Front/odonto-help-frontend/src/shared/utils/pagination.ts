export function buildTablePaginationCount(
  pageData: { numberOfElements: number; last: boolean } | undefined,
  page: number,
  size: number,
): number {
  if (!pageData) return -1;
  if (pageData.last) {
    return page * size + pageData.numberOfElements;
  }
  return page * size + pageData.numberOfElements + size;
}
