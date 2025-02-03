import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { QuoteService, Quote } from './quote.service';
import { Observable } from 'rxjs';

@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  /**
   * Endpoint to generate a quote for a mint order.
   * Expects a JSON body with "collateral" and "assets".
   */
  @Post('generate')
  generateQuote(@Body() body: { collateral: number; assets: { symbol: string; weight: number }[] }): Observable<Quote> {
    const { collateral, assets } = body;
    if (collateral === undefined || !assets || !Array.isArray(assets)) {
      throw new HttpException('Invalid input: collateral and assets are required', HttpStatus.BAD_REQUEST);
    }
    return this.quoteService.generateQuote(collateral, assets);
  }
}