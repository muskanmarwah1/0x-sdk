import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { ZeroExSdk } from '../src';
import { DAI_CONTRACT_ADDRESS_MAINNET, CHAIN_IDS } from '../src/constants';
import { ROPSTEN_RPC_TESTNET } from './constants';
import { RfqmQuote } from '../src/types';

describe('ZeroExSdk: get RFQm liquidity and fill order', () => {
  jest.setTimeout(120 * 1000);

  const WALLET_PRIVATE_KEY =
    'ebc9ecb342624853540531f439a917b889bdf7730fa84f226657831f806b0677';
  const ROPSTEN_PROVIDER = new StaticJsonRpcProvider(ROPSTEN_RPC_TESTNET);
  const WALLET = new Wallet(WALLET_PRIVATE_KEY);
  const ROPSTEN_SIGNER = WALLET.connect(ROPSTEN_PROVIDER);
  const CHAIN_ID = CHAIN_IDS.ROPSTEN;
  const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
  const TEST_TOKEN_A = '0xf84830b73b2ed3c7267e7638f500110ea47fdf30';
  const TEST_TOKEN_B = '0x374a16f5e686c09b0cc9e8bc3466b3b645c74aa7';

  it('fetches an indicative price', async () => {
    const sdk = new ZeroExSdk({
      apiUrl: 'https://api.matcha.0x.org',
    });

    const SELL_AMOUNT = (1e18).toString();
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
    const sdk = new ZeroExSdk({
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

  it('handles error if API key is invalid', async () => {
    const sdk = new ZeroExSdk({
      apiKey: 'invalid key',
    });
    const params = {
      buyToken: TEST_TOKEN_B,
      sellAmount: '10000000000000000',
      sellToken: TEST_TOKEN_A,
      takerAddress: '0xbbb5b49Db0cCb930f6E56A48eDC3e2C26Dbf6Fe2',
    };

    await expect(
      sdk.getFirmQuote({
        params,
        resource: 'rfqm',
        chainId: CHAIN_ID,
      })
    ).rejects.toThrow('Invalid API key');
  });

  it('fills RFQm order', async () => {
    const sdk = new ZeroExSdk({
      apiKey: process.env.RFQM_API_KEY,
    });
    const params = {
      buyToken: TEST_TOKEN_A,
      sellAmount: '10000000000000000',
      sellToken: TEST_TOKEN_B,
      takerAddress: '0xbbb5b49Db0cCb930f6E56A48eDC3e2C26Dbf6Fe2',
    };

    const quoteRes = (await sdk.getFirmQuote({
      params,
      resource: 'rfqm',
      chainId: CHAIN_ID,
    })) as RfqmQuote;
    const submitOrderResponse = await sdk.fillRfqmOrder({
      chainId: CHAIN_ID,
      quote: quoteRes,
      signer: ROPSTEN_SIGNER,
    });

    const poll = async function() {
      let result = await sdk.getRfqmTxStatus({
        txHash: submitOrderResponse.orderHash,
        chainId: CHAIN_ID,
      });
      while (result.status !== 'confirmed') {
        await new Promise(resolve => {
          setTimeout(resolve, 2000);
        });
        result = await sdk.getRfqmTxStatus({
          txHash: submitOrderResponse.orderHash,
          chainId: CHAIN_ID,
        });
      }
      return result;
    };

    let txnResponse = await poll();
    expect(txnResponse.status).toBe('confirmed');
    expect(txnResponse.transactions.length).toBe(1);
  });

  it('handles error if sell token has not been approved', async () => {
    const sdk = new ZeroExSdk({
      apiKey: process.env.RFQM_API_KEY,
    });
    const params = {
      buyToken: TEST_TOKEN_B,
      sellAmount: '10000000000000000',
      sellToken: TEST_TOKEN_A,
      takerAddress: '0xbbb5b49Db0cCb930f6E56A48eDC3e2C26Dbf6Fe2',
    };

    const quoteRes = (await sdk.getFirmQuote({
      params,
      resource: 'rfqm',
      chainId: CHAIN_ID,
    })) as RfqmQuote;

    await expect(
      sdk.fillRfqmOrder({
        quote: quoteRes,
        chainId: CHAIN_ID,
        signer: ROPSTEN_SIGNER,
      })
    ).rejects.toThrow('[Validation Failed] n/a: order is not fillable.');
  });
});
