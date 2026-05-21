import { Body, Controller, Post } from '@nestjs/common';
import { FavoriteQuoteRequest } from '@app/quotes/dtos/favorite-quote-request';
import { FavoriteQuoteUseCase } from '@app/quotes/use-cases/favorite-quote.use-case';

/**
 * Thin controller: receive the request, normalize it (here, enrich it with the
 * authenticated user), and delegate to the use case. No business logic.
 */
@Controller({ path: 'quotes', version: '1' })
export class QuotesController {
  public constructor(private readonly favoriteQuote: FavoriteQuoteUseCase) {}

  @Post('favorite')
  public async favorite(@Body() body: FavoriteQuoteRequest): Promise<void> {
    await this.favoriteQuote.handle({
      quoteUuid: body.quoteUuid,
      // In a real app the user comes from the auth guard.
      user: { id: 1 },
    });
  }
}
