import { Injectable } from '@nestjs/common';
import { QuoteRepositoryContract } from '@app/quotes/contracts/quote-repository.contract';
import type { FavoriteQuoteInput } from '@app/quotes/dtos/favorite-quote-input';
import type { UseCaseHandler } from '@app/shared/contracts/use-case-handler.contract';

/**
 * One use case per feature: an `@Injectable` class implementing `UseCaseHandler`
 * with a single `handle` method. This is the snippet documented in the
 * repository README — keeping it as compiled code stops the docs from rotting.
 */
@Injectable()
export class FavoriteQuoteUseCase implements UseCaseHandler<FavoriteQuoteInput> {
  public constructor(private readonly quoteRepository: QuoteRepositoryContract) {}

  public async handle(input: FavoriteQuoteInput): Promise<void> {
    const { quoteUuid, user } = input;

    const quote = await this.quoteRepository.findUniqueOrThrow({ where: { uuid: quoteUuid } });

    if (await this.quoteRepository.isFavorited({ where: { quoteId: quote.id, userId: user.id } })) {
      return;
    }

    await this.quoteRepository.favorite({ data: { quoteId: quote.id, userId: user.id } });
  }
}
