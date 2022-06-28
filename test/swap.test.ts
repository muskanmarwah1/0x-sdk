import { ZeroExSdk } from '../src';
import {
  ETH_FAKE_ADDRESS,
  DAI_CONTRACT_ADDRESS_MAINNET,
} from '../src/constants';

describe('ZeroExSdk: get liquidity', () => {
  describe('indicative price', () => {
    it('fetches an indicative price', async () => {
      const SELL_AMOUNT = (1e18).toString();
      const sdk = new ZeroExSdk(1);
      const price = await sdk.getIndicativePrice({
        sellToken: 'ETH',
        buyToken: 'DAI',
        sellAmount: SELL_AMOUNT,
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
      const sdk = new ZeroExSdk(1);
      const params = {
        buyToken: 'usdc',
        sellAmount: '1000000000000000000',
        sellToken: 'dai',
      };

      await expect(
        sdk.getIndicativePrice({ ...params, buyAmount: '1000000' })
      ).rejects.toThrow('Do not provide both fields');

      await expect(sdk.getIndicativePrice({})).rejects.toThrow(
        'The swap request params requires either a sellAmount or buyAmount'
      );

      await expect(sdk.getIndicativePrice(params)).resolves.toBeTruthy();
    });

    it('handles indicative price request errors', async () => {
      const sdk = new ZeroExSdk(1);
      const params = {
        buyToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        sellAmount: '26302304322109228',
      };

      await expect(
        sdk.getIndicativePrice({
          ...params,
          sellToken: 'doesntexist',
        })
      ).rejects.toThrow('Could not find token `doesntexist`');

      await expect(
        sdk.getIndicativePrice({
          ...params,
          sellToken: 'weth',
        })
      ).resolves.toBeTruthy();
    });
  });

  describe('firm quote', () => {
    it('fetches a firm quote', async () => {
      const SELL_AMOUNT = (1e18).toString();
      const sdk = new ZeroExSdk(1);
      const quote = await sdk.getFirmQuote({
        sellToken: 'ETH',
        buyToken: 'DAI',
        sellAmount: SELL_AMOUNT,
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
      expect(quote.data).toBeTruthy();
    });

    it('validates sellAmount and buyAmount params', async () => {
      const sdk = new ZeroExSdk(1);
      const params = {
        buyToken: 'usdc',
        sellAmount: '1000000000000000000',
        sellToken: 'dai',
      };

      await expect(
        sdk.getFirmQuote({ ...params, buyAmount: '1000000' })
      ).rejects.toThrow('Do not provide both fields');

      await expect(sdk.getFirmQuote({})).rejects.toThrow(
        'The swap request params requires either a sellAmount or buyAmount'
      );

      await expect(sdk.getFirmQuote(params)).resolves.toBeTruthy();
    });

    it('handles firm quote request errors', async () => {
      const sdk = new ZeroExSdk(1);
      const params = {
        buyToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        sellAmount: '26302304322109228',
        sellToken: ETH_FAKE_ADDRESS,
        taker: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      };

      await expect(
        sdk.getFirmQuote({
          ...params,
          sellToken: 'doesntexist',
        })
      ).rejects.toThrow('Could not find token `doesntexist`');

      await expect(
        sdk.getFirmQuote({
          ...params,
          sellToken: 'eth',
        })
      ).resolves.toBeTruthy();
    });
  });
});
