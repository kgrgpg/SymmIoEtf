import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CollateralService } from './collateral.service';
import { Observable } from 'rxjs';

@Controller('collateral')
export class CollateralController {
  constructor(private readonly collateralService: CollateralService) {}

  /**
   * Endpoint to lock collateral.
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
}