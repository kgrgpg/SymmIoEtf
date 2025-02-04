import { Controller, Post, Body, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CollateralService } from './collateral.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Controller('collateral')
export class CollateralController {
  constructor(private readonly collateralService: CollateralService) {}

  /**
   * Endpoint to broadcast a collateral lock on-chain.
   * Expects a JSON body with "userAddress" (the Ethereum address) and "amount" in ETH.
   */
  @Post('lock')
  lockCollateral(@Body() body: { userAddress: string; amount: number }): Observable<any> {
    const { userAddress, amount } = body;
    if (!userAddress || amount === undefined) {
      throw new HttpException('Invalid input: userAddress and amount are required', HttpStatus.BAD_REQUEST);
    }

    return this.collateralService.lockCollateral(userAddress, amount).pipe(
      map(result => result),
      catchError(err => {
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    );
  }

  /**
   * Endpoint to verify an existing collateral lock on-chain.
   * Expects a query parameter "userAddress".
   */
  @Get('verify')
  verifyCollateral(@Query('userAddress') userAddress: string): Observable<any> {
    if (!userAddress) {
      throw new HttpException('Invalid input: userAddress is required', HttpStatus.BAD_REQUEST);
    }
    return this.collateralService.verifyCollateral(userAddress).pipe(
      map(lockedInfo => lockedInfo),
      catchError(err => {
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    );
  }
}