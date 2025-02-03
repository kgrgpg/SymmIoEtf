import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class BinanceService {
  private readonly logger = new Logger(BinanceService.name);
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    // Use Binance testnet URL by default; you can override via environment variables
    this.baseUrl = process.env.BINANCE_API_URL || 'https://testnet.binance.vision/api';
  }

  /**
   * Fetch the order book for a given symbol.
   * @param symbol The trading pair (e.g., 'BTCUSDT').
   * @param limit The limit of order book entries to return.
   */
  getOrderBook(symbol: string, limit = 100): Observable<any> {
    const url = `${this.baseUrl}/v3/depth`;
    return this.httpService.get(url, {
      params: {
        symbol: symbol.toUpperCase(),
        limit,
      },
    }).pipe(
      map(response => {
        this.logger.debug(`Fetched order book for ${symbol}`);
        return response.data;
      }),
      catchError(error => {
        this.logger.error(`Error fetching order book for ${symbol}: ${error.message}`);
        return throwError(() => error);
      })
    );
  }

  /**
   * Place an order on Binance.
   * Note: In a production system, you'll need to sign the request properly.
   * For this trial, we simulate order placement.
   * @param order The order details (e.g., symbol, side, type, quantity, etc.)
   */
  placeOrder(order: any): Observable<any> {
    // For a real order, you would sign your request here.
    // For our reactive simulation, we use a dummy Observable.
    return new Observable(observer => {
      this.logger.debug(`Placing order: ${JSON.stringify(order)}`);
      setTimeout(() => {
        observer.next({ success: true, orderId: 'dummy-order-id', order });
        observer.complete();
      }, 500);
    });
  }
}