import qs from 'qs';
import fetch from 'isomorphic-unfetch';
import { validateAmounts, validateResponse, getRootApiEndpoint } from './utils';
import { Price, Quote, SwapParams } from './types';
import { MaxInt256, MaxUint256 } from '@ethersproject/constants';
import { Signer } from '@ethersproject/abstract-signer';
import { BaseProvider } from '@ethersproject/providers';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { TransactionOverrides } from './types';
import { ETH_FAKE_ADDRESS } from './constants';
import { Erc20__factory } from './contracts';

class ZeroExSdk {
  private chainId: number;

  public provider: BaseProvider;
  public signer: Signer;

  constructor(
    chainId: string | number,
    provider: BaseProvider,
    signer: Signer
  ) {
    this.chainId = parseInt(chainId.toString(10), 10);
    this.provider = provider;
    this.signer = signer;
  }

  /**
   * Fetches an indicative price for buying or selling an ERC20 token.
   * - {@link https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-price}
   * - {@link https://docs.0x.org/market-makers/docs/introduction#indicative-pricing}
   *
   * @param params - The request params for the 0x API `/swap` endpoint.
   * @param fetchFn - An optional fetch function.
   * @returns The indicative price
   */
  async getIndicativePrice(params: SwapParams, fetchFn = fetch) {
    validateAmounts(params);

    const endpoint = getRootApiEndpoint(this.chainId);
    const url = `${endpoint}/swap/v1/price?${qs.stringify(params)}`;
    const response = await fetchFn(url);

    await validateResponse(response);

    const data: Price = await response.json();

    return data;
  }

  /**
   * Fetches a firm quote for buying or selling an ERC20 token.
   * - {@link https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-quote}
   * - {@link https://docs.0x.org/market-makers/docs/introduction#firm-quotes}
   *
   * @param params - The request params for the 0x API `/quote` endpoint.
   * @param fetchFn - An optional fetch function.
   * @returns The firm quote
   */
  async getFirmQuote(params: SwapParams, fetchFn = fetch) {
    validateAmounts(params);

    const endpoint = getRootApiEndpoint(this.chainId);
    const url = `${endpoint}/swap/v1/quote?${qs.stringify(params)}`;
    const response = await fetchFn(url);

    await validateResponse(response);

    const data: Quote = await response.json();

    return data;
  }

  approveToken = async (
    tokenAddress: string,
    zeroExContractAddress: string,
    amount?: BigNumberish,
    txOptions?: TransactionOverrides
  ) => {
    const erc20 = Erc20__factory.connect(tokenAddress, this.signer);
    const tx = erc20.approve(zeroExContractAddress, amount ?? MaxInt256, {
      ...txOptions,
    });

    return tx;
  };

  getAllowance = async (
    tokenAddress: string,
    zeroExContractAddress: string,
    walletAddress: string
  ): Promise<BigNumber> => {
    const erc20 = Erc20__factory.connect(tokenAddress, this.provider);

    if (tokenAddress.toLowerCase() === ETH_FAKE_ADDRESS) {
      return MaxUint256;
    }

    const approvalAmount = await erc20.allowance(
      walletAddress,
      zeroExContractAddress
    );

    return approvalAmount;
  };
}

export { ZeroExSdk };
