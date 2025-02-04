import { Module } from '@nestjs/common';
import { MintingService } from './minting.service';
import { MintingController } from './minting.controller';

@Module({
  providers: [MintingService],
  controllers: [MintingController],
  exports: [MintingService],
})
export class MintingModule {}