import { Controller, Get, Query, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { Observable } from 'rxjs';

@Controller('binance')
export class BinanceController {
  constructor(private readonly binanceService: BinanceService) {}

  // Endpoint to fetch order book data. Example URL: GET /binance/orderbook?symbol=BTCUSDT&limit=100
  @Get('orderbook')
  getOrderBook(@Query('symbol') symbol: string, @Query('limit') limit: string): Observable<any> {
    if (!symbol) {
      throw new HttpException('Symbol is required', HttpStatus.BAD_REQUEST);
    }
    const orderLimit = limit ? parseInt(limit, 10) : 100;
    return this.binanceService.getOrderBook(symbol, orderLimit);
  }

  // Endpoint to simulate placing an order. Example URL: POST /binance/place-order
  // Body: { "symbol": "BTCUSDT", "side": "BUY", "quantity": 0.001, "type": "MARKET" }
  @Post('place-order')
  placeOrder(@Body() order: any): Observable<any> {
    return this.binanceService.placeOrder(order);
  }
}