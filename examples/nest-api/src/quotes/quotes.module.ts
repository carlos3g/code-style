import { Module } from '@nestjs/common';
import { QuoteRepositoryContract } from '@app/quotes/contracts/quote-repository.contract';
import { QuotesController } from '@app/quotes/quotes.controller';
import { InMemoryQuoteRepository } from '@app/quotes/repositories/in-memory-quote.repository';
import { FavoriteQuoteUseCase } from '@app/quotes/use-cases/favorite-quote.use-case';

/**
 * The module wires each repository contract to its concrete implementation, so
 * use cases depend only on the abstraction.
 */
@Module({
  controllers: [QuotesController],
  providers: [FavoriteQuoteUseCase, { provide: QuoteRepositoryContract, useClass: InMemoryQuoteRepository }],
})
export class QuotesModule {}
