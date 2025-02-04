import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { MintingService } from './minting.service';

@Controller('minting')
export class MintingController {
  constructor(private readonly mintingService: MintingService) {}

  /**
   * Endpoint to mint ETF tokens.
   * Expects a JSON body with "to" (recipient address) and "amount".
   */
  @Post('mint')
  async mintTokens(@Body() body: { to: string; amount: number }): Promise<any> {
    const { to, amount } = body;
    if (!to || amount === undefined) {
      throw new HttpException('Invalid input: "to" address and "amount" are required', HttpStatus.BAD_REQUEST);
    }
    try {
      const result = await this.mintingService.mintTokens(to, amount);
      return { success: true, result };
    } catch (error: any) {
      throw new HttpException(`Error minting tokens: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}