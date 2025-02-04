import { Module } from '@nestjs/common';
import { TokenMintingService } from './token-minting.service';
import { TokenMintingController } from './token-minting.controller';

@Module({
  providers: [TokenMintingService],
  controllers: [TokenMintingController],
  exports: [TokenMintingService],
})
export class TokenMintingModule {}