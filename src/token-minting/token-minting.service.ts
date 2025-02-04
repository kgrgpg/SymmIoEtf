import { Injectable, Logger } from '@nestjs/common';
import { JsonRpcProvider, Wallet, Contract, parseUnits } from 'ethers';

@Injectable()
export class TokenMintingService {
  private readonly logger = new Logger(TokenMintingService.name);
  private readonly provider: JsonRpcProvider;
  private readonly signer: Wallet;
  // Updated ABI for your contract
  private readonly contractAbi = [
    "function mintETFTokens(address to, uint256 amount) external returns (bool)",
    "function getLockedCollateral(address user) view returns (uint256)" // optional for debugging
  ];
  private readonly contractAddress = process.env.MINTING_CONTRACT_ADDRESS || '0xYourContractAddress';

  constructor() {
    const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
    this.provider = new JsonRpcProvider(rpcUrl);
    const privateKey = process.env.MINTING_PRIVATE_KEY || '';
    this.signer = new Wallet(privateKey, this.provider);
  }

  /**
   * Mint ETF tokens by calling the contract's mintETFTokens function.
   * @param to The recipient address.
   * @param amount The amount of tokens to mint (in decimal).
   */
  async mintTokens(to: string, amount: number): Promise<any> {
    try {
      this.logger.log(`Minting ${amount} tokens to ${to}`);
      const contract = new Contract(this.contractAddress, this.contractAbi, this.signer);
      // Convert 'amount' to 18 decimals
      const tx = await contract.mintETFTokens(to, parseUnits(amount.toString(), 18));
      this.logger.debug(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      this.logger.log(`Minting transaction confirmed: ${receipt.transactionHash}`);
      return receipt;
    } catch (error: any) {
      this.logger.error(`Error minting tokens: ${error.message}`);
      throw error;
    }
  }
}