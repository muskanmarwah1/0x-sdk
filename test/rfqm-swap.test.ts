import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { ZeroExSdk } from '../src';
import {
  DAI_CONTRACT_ADDRESS_MAINNET,
  GOERLI_RPC_TESTNET,
  CHAIN_IDS,
} from '../src/constants';

describe('ZeroExSdk: get RFQm order liquidity', () => {
  const WALLET_PRIVATE_KEY =
    'ebc9ecb342624853540531f439a917b889bdf7730fa84f226657831f806b0677';
  const GOERLI_PROVIDER = new StaticJsonRpcProvider(GOERLI_RPC_TESTNET);
  const WALLET = new Wallet(WALLET_PRIVATE_KEY);
  const SIGNER = WALLET.connect(GOERLI_PROVIDER);
  const CHAIN_ID = CHAIN_IDS.ROPSTEN;
  const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

  describe('RFQm indicative price', () => {
    it('fetches an indicative price', async () => {
      const SELL_AMOUNT = (1e18).toString();
      const sdk = new ZeroExSdk(CHAIN_ID, GOERLI_PROVIDER, SIGNER, {
        apiUrl: 'https://api.matcha.0x.org',
      });
      const price = await sdk.getIndicativePrice({
        params: {
          sellToken: 'WETH',
          buyToken: 'DAI',
          sellAmount: SELL_AMOUNT,
        },
        resource: 'rfqm',
      });

      expect(price.sellAmount).toBe(SELL_AMOUNT);

      expect('liquidityAvailable' in price).toBe(true);
      const ethPriceRange = [BigInt(1000), BigInt(4000)];
      const buyAmountUnits = BigInt(price.buyAmount) / BigInt(1e18);

      expect(buyAmountUnits).toBeGreaterThan(ethPriceRange[0]);
      expect(buyAmountUnits).toBeLessThan(ethPriceRange[1]);
      expect(price.buyTokenAddress.toLowerCase()).toBe(
        DAI_CONTRACT_ADDRESS_MAINNET
      );
      expect(price.sellTokenAddress.toLowerCase()).toBe(WETH_ADDRESS);
    });

    it('handles RFQm firm quote request errors', async () => {
      const sdk = new ZeroExSdk(CHAIN_ID, GOERLI_PROVIDER, SIGNER, {
        apiUrl: 'https://api.matcha.0x.org',
      });
      const params = {
        buyToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        sellAmount: '26302304322109228',
        sellToken: WETH_ADDRESS,
        takerAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      };

      await expect(
        sdk.getFirmQuote({
          params: {
            ...params,
            sellToken: 'doesntexist',
          },
          resource: 'rfqm',
        })
      ).rejects.toThrow('Token doesntexist is currently unsupported');

      await expect(
        sdk.getFirmQuote({
          params: {
            ...params,
            sellToken: 'ETH',
          },
          resource: 'rfqm',
        })
      ).rejects.toThrow(
        'Unwrapped Native Asset is not supported. Use WETH instead'
      );

      await expect(
        sdk.getFirmQuote({
          params: {
            ...params,
            sellToken: 'weth',
          },
          resource: 'rfqm',
        })
      ).resolves.toBeTruthy();
    });
  });
});
