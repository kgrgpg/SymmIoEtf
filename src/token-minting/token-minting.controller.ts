import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { TokenMintingService } from './token-minting.service';

@Controller('token-minting')
export class TokenMintingController {
  constructor(private readonly tokenMintingService: TokenMintingService) {}

  /**
   * Endpoint to mint ETF tokens on-chain.
   * Expects a JSON body with "to" and "amount".
   */
  @Post('mint')
  async mintTokens(@Body() body: { to: string; amount: number }): Promise<any> {
    const { to, amount } = body;
    if (!to || amount === undefined) {
      throw new HttpException('Invalid input: "to" and "amount" are required', HttpStatus.BAD_REQUEST);
    }
    try {
      const result = await this.tokenMintingService.mintTokens(to, amount);
      return { success: true, result };
    } catch (error: any) {
      throw new HttpException(`Error minting tokens: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}