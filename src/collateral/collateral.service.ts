import { Injectable, Logger } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ethers } from 'ethers';

@Injectable()
export class CollateralService {
  private readonly logger = new Logger(CollateralService.name);

  private readonly provider: ethers.JsonRpcProvider;
  private readonly wallet: ethers.Wallet;
  private readonly contract: ethers.Contract;

  constructor() {
    // Initialize an ethers provider using local Hardhat node or from env
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    // The private key for the contract's deployer (or a dedicated account)
    this.wallet = new ethers.Wallet(process.env.MINTING_PRIVATE_KEY as string, this.provider);

    // Minimum ABI needed to call lockCollateral and getLockedCollateral
    const abi = [
      "function lockCollateral() payable",
      "function getLockedCollateral(address user) view returns (uint256)"
    ];

    // Use the deployed contract address from .env
    const contractAddress = process.env.MINTING_CONTRACT_ADDRESS as string;

    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
    this.logger.log(`CollateralService connected to contract at ${contractAddress}`);
  }

  /**
   * Broadcast a transaction to lock collateral on-chain on behalf of userId.
   * For demonstration, we do not actually tie userId to msg.sender, because
   * our wallet is always this.backend's private key. On-chain, the locked collateral
   * is stored for the backend's address, not userId.
   *
   * If you truly want msg.sender = userId, you need that user's private key
   * or a signature from them.
   */
  lockCollateral(userId: string, amount: number): Observable<any> {
    this.logger.log(`Locking collateral on-chain for user ${userId}, amount: ${amount} ETH`);

    // Convert the user-friendly 'amount' (in ETH) to wei
    const valueWei = ethers.parseEther(amount.toString());

    // The actual transaction call
    const txPromise = this.contract.lockCollateral({ value: valueWei })
      .then((tx: ethers.TransactionResponse) => tx.wait()) // wait for mining
      .then((receipt) => {
        // In ethers v6, receipt can be null and uses 'hash' instead of 'transactionHash'
        if (!receipt) {
          throw new Error('Transaction was dropped or replaced (no receipt).');
        }
        // Return a structured response
        return {
          locked: true,
          userId,
          amount,
          // 'hash' is the ethers v6 replacement for 'transactionHash'
          transactionHash: receipt.hash,
        };
      });

    // Wrap the Promise in an Observable
    return from(txPromise).pipe(
      catchError((err) => {
        throw new Error(`Error locking collateral on-chain: ${err.message}`);
      })
    );
  }

  /**
   * Verify collateral on-chain for userId. Our contract expects an address, so in a real
   * system you'd pass that address. This reads from getLockedCollateral.
   */
  verifyCollateral(userId: string): Observable<any> {
    this.logger.log(`Verifying on-chain collateral for user ${userId}`);

    // If userId is not an address, you might need a lookup or mapping from userId -> address.
    // For simplicity, assume userId is an address here. In real usage, rename the param to userAddress or similar.
    const verifyPromise = this.contract.getLockedCollateral(userId).then((locked: bigint) => {
      return {
        verified: locked > 0n,
        userId,
        lockedAmount: locked.toString()
      };
    });

    return from(verifyPromise).pipe(
      catchError((err) => {
        throw new Error(`Error verifying collateral: ${err.message}`);
      })
    );
  }
}