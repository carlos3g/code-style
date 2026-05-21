import type { Quote } from '@app/quotes/entities/quote.entity';

/**
 * Repository contract. Every database access goes through an
 * `abstract class *RepositoryContract`; the module wires the concrete
 * implementation. Use cases depend on this, never on a concrete repository.
 */
export abstract class QuoteRepositoryContract {
  public abstract findUniqueOrThrow(params: { where: { uuid: string } }): Promise<Quote>;

  public abstract isFavorited(params: { where: { quoteId: number; userId: number } }): Promise<boolean>;

  public abstract favorite(params: { data: { quoteId: number; userId: number } }): Promise<void>;
}
