jest.setTimeout(30000); // Increase Jest timeout to 30 seconds

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JsonRpcProvider, Contract } from 'ethers';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

describe('Full Mint Flow E2E (All Via Backend)', () => {
  let app: INestApplication;
  let provider: JsonRpcProvider;
  let tokenContract: Contract;

  // The contract address from your .env
  const contractAddress = process.env.MINTING_CONTRACT_ADDRESS as string;

  // Minimal ABI for reading locked collateral and token balances
  const tokenAbi = [
    "function getLockedCollateral(address) view returns (uint256)",
    "function balanceOf(address) view returns (uint256)"
  ];

  // Test account from your Hardhat node (e.g., Account #0)
  // This account’s private key is in your .env as MINTING_PRIVATE_KEY
  const testAccount = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  beforeAll(async () => {
    // Create the NestJS testing module and initialize the application
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Connect to your local Hardhat node using ethers v6
    const rpcUrl = process.env.RPC_URL as string;
    provider = new JsonRpcProvider(rpcUrl);

    tokenContract = new Contract(contractAddress, tokenAbi, provider);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should lock collateral, verify it, run the mint flow, and finally mint tokens on-chain', async () => {
    // STEP 1: Lock collateral via the backend endpoint
    // This calls CollateralController.lockCollateral, which broadcasts a transaction on-chain
    const lockResponse = await request(app.getHttpServer())
      .post('/collateral/lock')
      .send({
        userAddress: testAccount,
        amount: 1 // 1 ETH
      })
      .expect(201);

    console.log('Backend Collateral Lock Response:', lockResponse.body);
    // Example: { locked: true, userAddress: "...", amount: 1, transactionHash: "0x..." }

    // STEP 2: Verify the collateral via the backend endpoint (on-chain read)
    // The CollateralController.verifyCollateral calls getLockedCollateral on-chain
    const verifyResponse = await request(app.getHttpServer())
      .get(`/collateral/verify?userAddress=${testAccount}`)
      .expect(200);

    console.log('Backend Collateral Verify Response:', verifyResponse.body);
    // Example: { verified: true, userAddress: "...", lockedAmount: "1000000000000000000" }

    // We expect lockedAmount to be > 0
    const lockedOnChain = BigInt(verifyResponse.body.lockedAmount);
    expect(lockedOnChain).toBeGreaterThan(BigInt(0));

    // STEP 3: Initiate the complete mint process via the backend
    // We simulate a user with userId 'user123' who has 'collateral' = 1000 in the simulation.
    // assets describe the ETF composition.
    const mintFlowResponse = await request(app.getHttpServer())
      .post('/etf-mint')
      .send({
        userId: 'user123',
        collateral: 1000,
        assets: [
          { symbol: 'BTCUSDT', weight: 0.5 },
          { symbol: 'ETHUSDT', weight: 0.5 }
        ],
        verifyCollateral: false
      })
      .expect(201);

    console.log('Mint Flow Response (Backend):', mintFlowResponse.body);

    // STEP 4: Actually mint tokens on-chain using the token-minting endpoint
    // This calls TokenMintingService, which calls mintETFTokens(to, amount) on the contract
    const tokenMintResponse = await request(app.getHttpServer())
      .post('/token-minting/mint')
      .send({
        to: testAccount,
        amount: 10
      })
      .expect(201);

    console.log('Token Mint Response (Backend):', tokenMintResponse.body);
    // Example: { success: true, result: {...transactionReceipt...} }

    // STEP 5: Verify on-chain that tokens were minted by checking the recipient's balance
    const balance = await tokenContract.balanceOf(testAccount);
    console.log('On-chain Token Balance for test account:', balance.toString());
    expect(balance).toBeTruthy(); // or numeric check as below
    expect(BigInt(balance.toString())).toBeGreaterThan(BigInt(0));
  });
});