import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AssetPurchaseService } from './asset-purchase.service';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Controller('asset-purchase')
export class AssetPurchaseController {
  constructor(private readonly assetPurchaseService: AssetPurchaseService) {}

  /**
   * Endpoint to simulate purchasing underlying assets.
   * Expects a JSON body with order details (including assets, collateral, quoteId, etc.).
   */
  @Post('purchase')
  purchaseAssets(@Body() orderData: any): Observable<any> {
    if (!orderData || !orderData.assets || orderData.collateral === undefined) {
      throw new HttpException('Invalid input: assets and collateral are required', HttpStatus.BAD_REQUEST);
    }
    return this.assetPurchaseService.purchaseAssets(orderData).pipe(
      catchError(err => {
        throw new HttpException(`Error during asset purchase: ${err.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    );
  }
}