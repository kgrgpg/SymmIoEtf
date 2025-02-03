import { Injectable, Logger } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable()
export class CollateralService {
  private readonly logger = new Logger(CollateralService.name);

  /**
   * Simulate locking collateral for a user.
   * In a real implementation, this would interact with a smart contract or a database.
   * @param userId - The identifier for the user.
   * @param amount - The amount of collateral to lock.
   */
  lockCollateral(userId: string, amount: number): Observable<{ locked: boolean; userId: string; amount: number }> {
    this.logger.log(`Locking collateral for user ${userId} of amount ${amount}`);
    // Simulate some processing delay (e.g., blockchain transaction time)
    return of({ locked: true, userId, amount }).pipe(delay(500));
  }
}