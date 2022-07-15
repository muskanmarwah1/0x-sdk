import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { ZeroExSdk } from '../src';
import {
  ETH_FAKE_ADDRESS,
  DAI_CONTRACT_ADDRESS_MAINNET,
  ROPSTEN_RPC_TESTNET,
  GOERLI_RPC_TESTNET,
  CHAIN_IDS,
} from '../src/constants';
import { SwapQuote } from '../src/types';

describe('ZeroExSdk: get liquidity', () => {
  const WALLET_PRIVATE_KEY =
    'ebc9ecb342624853540531f439a917b889bdf7730fa84f226657831f806b0677';
  const GOERLI_PROVIDER = new StaticJsonRpcProvider(GOERLI_RPC_TESTNET);
  const WALLET = new Wallet(WALLET_PRIVATE_KEY);
  const SIGNER = WALLET.connect(GOERLI_PROVIDER);
  const CHAIN_ID = CHAIN_IDS.MAINNET;

  describe('indicative price', () => {
    it('fetches an indicative price', async () => {
      const SELL_AMOUNT = (1e18).toString();
      const sdk = new ZeroExSdk(CHAIN_ID, GOERLI_PROVIDER, SIGNER);
      const price = await sdk.getIndicativePrice({
        params: {
          sellToken: 'ETH',
          buyToken: 'DAI',
          sellAmount: SELL_AMOUNT,
        },
      });

      expect(price.sellAmount).toBe(SELL_AMOUNT);

      const ethPriceRange = [BigInt(1000), BigInt(4000)];
      const buyAmountUnits = BigInt(price.buyAmount) / BigInt(1e18);

      expect(buyAmountUnits).toBeGreaterThan(ethPriceRange[0]);
      expect(buyAmountUnits).toBeLessThan(ethPriceRange[1]);
      expect(price.buyTokenAddress.toLowerCase()).toBe(
        DAI_CONTRACT_ADDRESS_MAINNET
      );
      expect(price.sellTokenAddress.toLowerCase()).toBe(ETH_FAKE_ADDRESS);
      expect('data' in price).toBe(false);
    });

    it('validates sellAmount and buyAmount params', async () => {
      const sdk = new ZeroExSdk(CHAIN_ID, GOERLI_PROVIDER, SIGNER);
      const params = {
        buyToken: 'usdc',
        sellAmount: '1000000000000000000',
        sellToken: 'dai',
      };

      await expect(
        sdk.getIndicativePrice({ params: { ...params, buyAmount: '1000000' } })
      ).rejects.toThrow('Do not provide both fields');

      await expect(sdk.getIndicativePrice({ params: {} })).rejects.toThrow(
        'The swap request params requires either a sellAmount or buyAmount'
      );

      await expect(sdk.getIndicativePrice({ params })).resolves.toBeTruthy();
    });

    it('handles indicative price request errors', async () => {
      const sdk = new ZeroExSdk(CHAIN_ID, GOERLI_PROVIDER, SIGNER);
      const params = {
        buyToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        sellAmount: '26302304322109228',
      };

      await expect(
        sdk.getIndicativePrice({
          params: {
            ...params,
            sellToken: 'doesntexist',
          },
        })
      ).rejects.toThrow('Could not find token `doesntexist`');

      await expect(
        sdk.getIndicativePrice({
          params: {
            ...params,
            sellToken: 'weth',
          },
        })
      ).resolves.toBeTruthy();
    });
  });

  describe('firm quote', () => {
    it('fetches a firm quote', async () => {
      const SELL_AMOUNT = (1e18).toString();
      const sdk = new ZeroExSdk(CHAIN_ID, GOERLI_PROVIDER, SIGNER);
      const quote = await sdk.getFirmQuote({
        params: {
          sellToken: 'ETH',
          buyToken: 'DAI',
          sellAmount: SELL_AMOUNT,
        },
      });

      expect(quote.sellAmount).toBe(SELL_AMOUNT);

      const ethPriceRange = [BigInt(1000), BigInt(4000)];
      const buyAmountUnits = BigInt(quote.buyAmount) / BigInt(1e18);

      expect(buyAmountUnits).toBeGreaterThan(ethPriceRange[0]);
      expect(buyAmountUnits).toBeLessThan(ethPriceRange[1]);
      expect(quote.buyTokenAddress.toLowerCase()).toBe(
        DAI_CONTRACT_ADDRESS_MAINNET
      );
      expect(quote.sellTokenAddress.toLowerCase()).toBe(ETH_FAKE_ADDRESS);
      if ('data' in quote) {
        expect(quote?.data).toBeTruthy();
      }
    });

    it('validates sellAmount and buyAmount params', async () => {
      const sdk = new ZeroExSdk(CHAIN_ID, GOERLI_PROVIDER, SIGNER);
      const params = {
        buyToken: 'usdc',
        sellAmount: '1000000000000000000',
        sellToken: 'dai',
      };

      await expect(
        sdk.getFirmQuote({ params: { ...params, buyAmount: '1000000' } })
      ).rejects.toThrow('Do not provide both fields');

      await expect(sdk.getFirmQuote({ params: {} })).rejects.toThrow(
        'The swap request params requires either a sellAmount or buyAmount'
      );

      await expect(sdk.getFirmQuote({ params })).resolves.toBeTruthy();
    });

    it('handles firm quote request errors', async () => {
      const sdk = new ZeroExSdk(CHAIN_ID, GOERLI_PROVIDER, SIGNER);
      const params = {
        buyToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        sellAmount: '26302304322109228',
        sellToken: ETH_FAKE_ADDRESS,
        taker: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      };

      await expect(
        sdk.getFirmQuote({
          params: {
            ...params,
            sellToken: 'doesntexist',
          },
        })
      ).rejects.toThrow('Could not find token `doesntexist`');

      await expect(
        sdk.getFirmQuote({
          params: {
            ...params,
            sellToken: 'eth',
          },
        })
      ).resolves.toBeTruthy();
    });
  });
});

describe('ZeroExSdk: fill swap order', () => {
  jest.setTimeout(120 * 1000);
  const WALLET_PRIVATE_KEY =
    'ebc9ecb342624853540531f439a917b889bdf7730fa84f226657831f806b0677';
  // Use Ropsten until 0x API releases Goerli endpoint
  const ROPSTEN_PROVIDER = new StaticJsonRpcProvider(ROPSTEN_RPC_TESTNET);
  const WALLET = new Wallet(WALLET_PRIVATE_KEY);
  const SIGNER = WALLET.connect(ROPSTEN_PROVIDER);
  const CHAIN_ID = CHAIN_IDS.ROPSTEN;

  describe('fill swap order', () => {
    it('successfully fills a swap order', async () => {
      const sdk = new ZeroExSdk(CHAIN_ID, ROPSTEN_PROVIDER, SIGNER);
      // Fetches firm quote
      const quote = (await sdk.getFirmQuote({
        params: {
          sellToken: 'ETH',
          buyToken: 'DAI',
          sellAmount: (1e9).toString(),
          takerAddress: SIGNER.address,
        },
      })) as SwapQuote;
      // Fills quote and wait for tx confirmation
      const txResponse = await sdk.fillOrder(quote);
      // Wait for tx to be confirmed and mined
      const { status, transactionHash } = await txResponse.wait();
      expect(status).toBe(1); // 0 = reverted, 1 = success
      expect(transactionHash).toBeTruthy();
    });
  });
});
