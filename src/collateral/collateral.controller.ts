import { Controller, Post, Body, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CollateralService } from './collateral.service';
import { Observable } from 'rxjs';

@Controller('collateral')
export class CollateralController {
  constructor(private readonly collateralService: CollateralService) {}

  /**
   * Endpoint to broadcast a collateral lock.
   * Expects a JSON body with "userId" and "amount".
   */
  @Post('lock')
  lockCollateral(@Body() body: { userId: string; amount: number }): Observable<any> {
    const { userId, amount } = body;
    if (!userId || amount === undefined) {
      throw new HttpException('Invalid input: userId and amount are required', HttpStatus.BAD_REQUEST);
    }
    return this.collateralService.lockCollateral(userId, amount);
  }

  /**
   * Endpoint to verify an existing collateral lock.
   * Expects a query parameter "userId".
   */
  @Get('verify')
  verifyCollateral(@Query('userId') userId: string): Observable<any> {
    if (!userId) {
      throw new HttpException('Invalid input: userId is required', HttpStatus.BAD_REQUEST);
    }
    return this.collateralService.verifyCollateral(userId);
  }
}