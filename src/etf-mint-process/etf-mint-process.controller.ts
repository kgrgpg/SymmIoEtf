import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ETFMintProcessService } from './etf-mint-process.service';
import { Observable } from 'rxjs';

@Controller('etf-mint')
export class ETFMintProcessController {
  constructor(private readonly etfMintProcessService: ETFMintProcessService) {}

  /**
   * Endpoint to initiate the full mint process.
   * Expects a JSON body with "userId", "collateral", "assets" and optionally "verifyCollateral" flag.
   */
  @Post()
  initiateMintProcess(
    @Body() body: { userId: string; collateral: number; assets: { symbol: string; weight: number }[]; verifyCollateral?: boolean },
  ): Observable<any> {
    const { userId, collateral, assets, verifyCollateral } = body;
    if (!userId || collateral === undefined || !assets || !Array.isArray(assets)) {
      throw new HttpException('Invalid input: userId, collateral, and assets are required', HttpStatus.BAD_REQUEST);
    }
    return this.etfMintProcessService.initiateMintProcess(userId, collateral, assets, verifyCollateral || false);
  }
}