import { Injectable, Logger } from '@nestjs/common';
import { CollateralService } from '../collateral/collateral.service';
import { QuoteService, Quote } from '../quote/quote.service';
import { AssetPurchaseService } from '../asset-purchase/asset-purchase.service';
import { Observable, of } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';

@Injectable()
export class ETFMintProcessService {
  private readonly logger = new Logger(ETFMintProcessService.name);

  constructor(
    private readonly collateralService: CollateralService,
    private readonly quoteService: QuoteService,
    private readonly assetPurchaseService: AssetPurchaseService,
  ) {}

  /**
   * Orchestrates the full mint process:
   * 1. Either verifies existing collateral or locks new collateral.
   * 2. Generates a quote based on collateral and asset weights.
   * 3. Purchases underlying assets using the generated quote.
   *
   * @param userId The user identifier.
   * @param collateral The collateral amount.
   * @param assets An array of assets with symbol and weight.
   * @param verifyFirst If true, verifies existing collateral; otherwise, locks new collateral.
   */
  initiateMintProcess(
    userId: string,
    collateral: number,
    assets: { symbol: string; weight: number }[],
    verifyFirst: boolean = false,
  ): Observable<any> {
    // Explicitly type the collateral observable as Observable<any>
    const collateral$: Observable<any> = verifyFirst
      ? this.collateralService.verifyCollateral(userId)
      : this.collateralService.lockCollateral(userId, collateral);

    return collateral$.pipe(
      mergeMap((lockResult: any): Observable<any> => {
        this.logger.debug(`Collateral step complete: ${JSON.stringify(lockResult)}`);
        return this.quoteService.generateQuote(collateral, assets).pipe(
          mergeMap((quote: Quote): Observable<any> => {
            this.logger.debug(`Quote generated: ${JSON.stringify(quote)}`);
            const purchaseData = { collateral, assets, quoteId: quote.quoteId };
            return this.assetPurchaseService.purchaseAssets(purchaseData).pipe(
              map((purchaseResult: any): any => ({
                collateralStep: lockResult,
                quote,
                assetPurchase: purchaseResult,
              }))
            );
          })
        );
      }),
      catchError((err: any) => {
        this.logger.error(`Error in mint process: ${err.message}`);
        return of({ error: err.message });
      })
    );
  }
}