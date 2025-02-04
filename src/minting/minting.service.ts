import { Injectable, Logger } from '@nestjs/common';
import { JsonRpcProvider, Wallet, Contract, parseUnits } from 'ethers';

@Injectable()
export class MintingService {
  private readonly logger = new Logger(MintingService.name);
  private readonly provider: JsonRpcProvider;
  private readonly signer: Wallet;
  // Replace with your actual contract ABI and address
  private readonly contractAbi = [
    "function mint(address to, uint256 amount) public returns (bool)"
  ];
  private readonly contractAddress = process.env.MINTING_CONTRACT_ADDRESS || '0xYourContractAddress';

  constructor() {
    // Use a live RPC endpoint or testnet RPC URL as needed
    const rpcUrl = process.env.RPC_URL || 'https://eth-goerli.alchemyapi.io/v2/your-api-key';
    this.provider = new JsonRpcProvider(rpcUrl);
    // Use a secure private key from your environment variables
    const privateKey = process.env.MINTING_PRIVATE_KEY || '0xYourPrivateKey';
    this.signer = new Wallet(privateKey, this.provider);
  }

  /**
   * Mint ETF tokens by calling the smart contract's mint function.
   * @param to The recipient address.
   * @param amount The amount of tokens to mint.
   */
  async mintTokens(to: string, amount: number): Promise<any> {
    try {
      this.logger.log(`Minting ${amount} tokens to ${to}`);
      const contract = new Contract(this.contractAddress, this.contractAbi, this.signer);
      // In ethers v6, use parseUnits directly (imported above) instead of ethers.utils.parseUnits
      const tx = await contract.mint(to, parseUnits(amount.toString(), 18));
      this.logger.debug(`Transaction sent: ${tx.hash}`);
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      this.logger.log(`Minting transaction confirmed: ${receipt.transactionHash}`);
      return receipt;
    } catch (error: any) {
      this.logger.error(`Error minting tokens: ${error.message}`);
      throw error;
    }
  }
}