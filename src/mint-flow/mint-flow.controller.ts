import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { MintFlowService } from './mint-flow.service';
import { Observable } from 'rxjs';

@Controller('mint-flow')
export class MintFlowController {
  constructor(private readonly mintFlowService: MintFlowService) {}

  /**
   * Endpoint to initiate the full mint flow.
   * Expects a JSON body with "userId", "collateral", and "assets".
   */
  @Post()
  initiateMintFlow(
    @Body() body: { userId: string; collateral: number; assets: { symbol: string; weight: number }[] },
  ): Observable<any> {
    const { userId, collateral, assets } = body;
    if (!userId || collateral === undefined || !assets || !Array.isArray(assets)) {
      throw new HttpException('Invalid input: userId, collateral, and assets are required', HttpStatus.BAD_REQUEST);
    }
    return this.mintFlowService.initiateMintFlow(userId, collateral, assets);
  }
}