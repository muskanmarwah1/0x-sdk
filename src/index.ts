import qs from 'qs';
import fetch from 'isomorphic-unfetch';
import { validateAmounts, validateResponse, getRootApiEndpoint } from './utils';
import { Price, Quote, SwapParams } from './types';

class ZeroExSdk {
  private chainId: number;

  constructor(chainId: string | number) {
    this.chainId = parseInt(chainId.toString(10), 10);
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
}

export { ZeroExSdk };
