import { IsUUID } from 'class-validator';

/**
 * Incoming HTTP payload — validated at the edge by `class-validator` through
 * the global `ValidationPipe`.
 */
export class FavoriteQuoteRequest {
  @IsUUID()
  public readonly quoteUuid!: string;
}
