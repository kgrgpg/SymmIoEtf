import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AxiosResponse } from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class BinanceService {
  private readonly logger = new Logger(BinanceService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private readonly httpService: HttpService) {
    // For production, set BINANCE_API_URL to live endpoint (e.g., https://api.binance.com/api)
    this.baseUrl = process.env.BINANCE_API_URL || 'https://testnet.binance.vision/api';
    this.apiKey = process.env.BINANCE_API_KEY || '';
    this.apiSecret = process.env.BINANCE_API_SECRET || '';
  }

  /**
   * Helper to sign a query string using HMAC SHA256.
   */
  private sign(queryString: string): string {
    return crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
  }

  /**
   * Place a signed order on Binance.
   * This method builds the query parameters, signs them, and calls Binance's order endpoint.
   *
   * @param order The order details (e.g., symbol, side, type, quantity, etc.)
   */
  placeSignedOrder(order: any): Observable<any> {
    const endpoint = '/v3/order';
    // Add a timestamp (as required by Binance)
    order.timestamp = Date.now();
    
    // Build the query string from order parameters
    const queryString = Object.keys(order)
      .sort() // sort parameters (recommended)
      .map(key => `${key}=${encodeURIComponent(order[key])}`)
      .join('&');

    // Sign the query string
    const signature = this.sign(queryString);

    // Append signature to the query
    const finalQuery = `${queryString}&signature=${signature}`;
    const url = `${this.baseUrl}${endpoint}?${finalQuery}`;

    this.logger.debug(`Placing signed order. URL: ${url}`);

    // Set headers including the API key
    const headers = {
      'X-MBX-APIKEY': this.apiKey,
    };

    return this.httpService.post(url, {}, { headers }).pipe(
      map((response: AxiosResponse<any>) => {
        this.logger.debug(`Order placed successfully: ${JSON.stringify(response.data)}`);
        return response.data;
      }),
      catchError(error => {
        this.logger.error(`Error placing signed order: ${error.message}`);
        return throwError(() => error);
      })
    );
  }

  /**
   * For backward compatibility or testing, we still have our simulated order placement.
   */
  placeOrder(order: any): Observable<any> {
    // For testing, simulate an order placement as before
    return new Observable(observer => {
      this.logger.debug(`Placing simulated order: ${JSON.stringify(order)}`);
      setTimeout(() => {
        observer.next({ success: true, orderId: 'dummy-order-id', order });
        observer.complete();
      }, 500);
    });
  }

  /**
   * Fetch order book as before.
   */
  getOrderBook(symbol: string, limit = 100): Observable<any> {
    const url = `${this.baseUrl}/v3/depth`;
    return this.httpService.get<any>(url, {
      params: {
        symbol: symbol.toUpperCase(),
        limit,
      },
    }).pipe(
      map((response: AxiosResponse<any>) => {
        this.logger.debug(`Fetched order book for ${symbol}`);
        return response.data;
      }),
      catchError(error => {
        this.logger.error(`Error fetching order book for ${symbol}: ${error.message}`);
        return throwError(() => error);
      })
    );
  }
}