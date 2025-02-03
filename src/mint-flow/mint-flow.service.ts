import { Injectable, Logger } from '@nestjs/common';
import { CollateralService } from '../collateral/collateral.service';
import { QuoteService, Quote } from '../quote/quote.service';
import { AssetPurchaseService } from '../asset-purchase/asset-purchase.service';
import { Observable, of } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';

@Injectable()
export class MintFlowService {
  private readonly logger = new Logger(MintFlowService.name);

  constructor(
    private readonly collateralService: CollateralService,
    private readonly quoteService: QuoteService,
    private readonly assetPurchaseService: AssetPurchaseService,
  ) {}

  /**
   * Orchestrates the full mint flow:
   * 1. Lock collateral for the user.
   * 2. Generate a quote based on the locked collateral and asset weights.
   * 3. Purchase underlying assets using the generated quote.
   *
   * @param userId The user identifier.
   * @param collateral The collateral amount to lock.
   * @param assets An array of assets with symbol and weight.
   */
  initiateMintFlow(
    userId: string,
    collateral: number,
    assets: { symbol: string; weight: number }[],
  ): Observable<any> {
    return this.collateralService.lockCollateral(userId, collateral).pipe(
      mergeMap(lockResult => {
        this.logger.debug(`Collateral locked: ${JSON.stringify(lockResult)}`);
        return this.quoteService.generateQuote(collateral, assets).pipe(
          mergeMap((quote: Quote) => {
            this.logger.debug(`Quote generated: ${JSON.stringify(quote)}`);
            // Create purchase data using collateral, assets, and the quote ID.
            const purchaseData = { collateral, assets, quoteId: quote.quoteId };
            return this.assetPurchaseService.purchaseAssets(purchaseData).pipe(
              map(purchaseResult => ({
                collateralLock: lockResult,
                quote,
                assetPurchase: purchaseResult,
              }))
            );
          })
        );
      }),
      catchError(err => {
        this.logger.error(`Error in mint flow: ${err.message}`);
        return of({ error: err.message });
      })
    );
  }
}