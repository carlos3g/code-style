/**
 * Use case input — already enriched with the authenticated user, so it is
 * distinct from the raw HTTP request DTO.
 */
export interface FavoriteQuoteInput {
  quoteUuid: string;
  user: { id: number };
}
