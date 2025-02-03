import { Injectable, Logger } from '@nestjs/common';
import { BinanceService } from '../binance/binance.service';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

@Injectable()
export class AssetPurchaseService {
  private readonly logger = new Logger(AssetPurchaseService.name);

  constructor(private readonly binanceService: BinanceService) {}

  /**
   * Simulate purchasing underlying assets based on the provided order details.
   * For each asset, call the BinanceService to place a simulated order.
   * @param orderData - An object containing asset details, for example:
   *   { assets: [ { symbol: 'BTCUSDT', weight: 0.5 }, { symbol: 'ETHUSDT', weight: 0.5 } ], collateral: number, quoteId: string }
   */
  purchaseAssets(orderData: any): Observable<any> {
    const assets = orderData.assets;
    if (!assets || !Array.isArray(assets)) {
      return of({ error: 'No assets provided for purchase' });
    }

    // For each asset, simulate placing an order.
    // Here we assume a simple scenario where each asset order is executed independently.
    const purchaseObservables = assets.map(asset => {
      // Create a dummy order for this asset.
      const order = {
        symbol: asset.symbol,
        side: 'BUY',
        type: 'MARKET',
        // For simulation, we calculate quantity proportional to the asset weight and collateral.
        quantity: (orderData.collateral * asset.weight) / 10000, // dummy calculation
      };

      this.logger.debug(`Placing simulated order for ${asset.symbol} with order: ${JSON.stringify(order)}`);

      // Call BinanceService.placeOrder for each asset.
      return this.binanceService.placeOrder(order).pipe(
        catchError(error => {
          this.logger.error(`Error placing order for ${asset.symbol}: ${error.message}`);
          return of({ symbol: asset.symbol, error: error.message });
        }),
        map(response => ({
          symbol: asset.symbol,
          response,
        }))
      );
    });

    // Use forkJoin to wait until all asset orders are processed.
    return forkJoin(purchaseObservables).pipe(
      map(results => {
        this.logger.log(`All asset purchase orders processed: ${JSON.stringify(results)}`);
        return {
          message: 'Asset purchase simulation complete',
          results,
        };
      })
    );
  }
}