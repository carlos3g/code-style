import { Injectable, NotFoundException } from '@nestjs/common';
import { QuoteRepositoryContract } from '@app/quotes/contracts/quote-repository.contract';
import type { Quote } from '@app/quotes/entities/quote.entity';

/**
 * Concrete implementation of the repository contract. A real service would back
 * this with Prisma; an in-memory store keeps the example dependency-free while
 * still exercising the contract.
 */
@Injectable()
export class InMemoryQuoteRepository extends QuoteRepositoryContract {
  private readonly quotes: readonly Quote[] = [
    {
      id: 1,
      uuid: '6f9619ff-8b86-d011-b42d-00cf4fc964ff',
      text: 'Stay hungry, stay foolish.',
      author: 'Stewart Brand',
    },
  ];

  private readonly favorites = new Set<string>();

  public findUniqueOrThrow(params: { where: { uuid: string } }): Promise<Quote> {
    const quote = this.quotes.find((item) => item.uuid === params.where.uuid);

    if (!quote) {
      return Promise.reject(new NotFoundException('Quote not found'));
    }

    return Promise.resolve(quote);
  }

  public isFavorited(params: { where: { quoteId: number; userId: number } }): Promise<boolean> {
    return Promise.resolve(this.favorites.has(this.favoriteKey(params.where)));
  }

  public favorite(params: { data: { quoteId: number; userId: number } }): Promise<void> {
    this.favorites.add(this.favoriteKey(params.data));

    return Promise.resolve();
  }

  private favoriteKey(ref: { quoteId: number; userId: number }): string {
    return `${String(ref.userId)}:${String(ref.quoteId)}`;
  }
}
