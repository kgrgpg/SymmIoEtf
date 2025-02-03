import { Module } from '@nestjs/common';
import { CollateralService } from './collateral.service';
import { CollateralController } from './collateral.controller';

@Module({
  providers: [CollateralService],
  controllers: [CollateralController],
  exports: [CollateralService],
})
export class CollateralModule {}