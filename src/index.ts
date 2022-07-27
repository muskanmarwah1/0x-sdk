import { Signer } from '@ethersproject/abstract-signer';
import { BigNumberish } from '@ethersproject/bignumber';
import { MaxInt256, MaxUint256 } from '@ethersproject/constants';
import { BaseProvider, TransactionResponse } from '@ethersproject/providers';
import { arrayify, splitSignature } from '@ethersproject/bytes';
import fetch from 'isomorphic-unfetch';
import qs from 'qs';
import { ETH_FAKE_ADDRESS } from './constants';
import { Erc20__factory } from './contracts';
import {
  ZeroExSdkOptions,
  FetchPriceOrQuoteArgs,
  SwapPrice,
  TransactionOverrides,
  RfqmPrice,
  RfqmQuote,
  SwapQuote,
  PostRfqmTransactionSubmitSerializedResponse,
  RfqmTransactionStatusResponse,
  RfqmTypes,
} from './types';
import {
  validateAmounts,
  validateResponse,
  getRootApiEndpoint,
  verifyRfqmIsLiveOrThrow,
} from './utils';

class ZeroExSdk {
  private chainId: number;
  public provider: BaseProvider;
  public signer: Signer;
  private ZeroExSdkOptions?: ZeroExSdkOptions;

  constructor(
    chainId: string | number,
    provider: BaseProvider,
    signer: Signer,
    ZeroExSdkOptions?: ZeroExSdkOptions
  ) {
    this.chainId = parseInt(chainId.toString(10), 10);
    this.provider = provider;
    this.signer = signer;
    this.ZeroExSdkOptions = ZeroExSdkOptions;
  }

  /**
   * Fetches an indicative price for buying or selling an ERC20 token.
   * - {@link https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-price}
   * - {@link https://docs.0x.org/market-makers/docs/introduction#indicative-pricing}
   *
   * @param params: The request params for the 0x API `/price` endpoint.
   * @param type: Optional 'swap' or 'rfqm' resource type. Defaults to 'swap'.
   * @param fetchFn: An optional fetch function.
   * @returns The indicative price
   */
  async getIndicativePrice({
    params,
    resource = 'swap',
    fetchFn = fetch,
  }: FetchPriceOrQuoteArgs): Promise<SwapPrice | RfqmPrice> {
    validateAmounts(params);
    const endpoint =
      this.ZeroExSdkOptions?.apiUrl ?? getRootApiEndpoint(this.chainId);

    if (resource === 'rfqm') {
      verifyRfqmIsLiveOrThrow(endpoint);
      const url = `${endpoint}/rfqm/v1/price?${qs.stringify(params)}`;
      const response = await fetchFn(url, {
        headers: {
          ...(this.ZeroExSdkOptions?.apiKey && {
            '0x-api-key': this.ZeroExSdkOptions?.apiKey,
          }),
        },
      });
      await validateResponse(response);
      const data: RfqmPrice = await response.json();
      return data;
    }

    const url = `${endpoint}/swap/v1/price?${qs.stringify(params)}`;
    const response = await fetchFn(url);
    await validateResponse(response);
    const data: SwapPrice = await response.json();
    return data;
  }

  /**
   * Fetches a firm quote for buying or selling an ERC20 token.
   * - {@link https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-quote}
   * - {@link https://docs.0x.org/market-makers/docs/introduction#firm-quotes}
   *
   * @param params: The request params for the 0x API `/quote` endpoint.
   * @param type: Optional 'swap' or 'rfqm' resource type. Defaults to 'swap'.
   * @param fetchFn: An optional fetch function.
   * @returns The firm quote
   */
  async getFirmQuote({
    params,
    resource = 'swap',
    fetchFn = fetch,
  }: FetchPriceOrQuoteArgs): Promise<SwapQuote | RfqmQuote> {
    validateAmounts(params);
    const endpoint =
      this.ZeroExSdkOptions?.apiUrl ?? getRootApiEndpoint(this.chainId);

    if (resource === 'rfqm') {
      verifyRfqmIsLiveOrThrow(endpoint);
      const url = `${endpoint}/rfqm/v1/quote?${qs.stringify(params)}`;
      const response = await fetchFn(url, {
        headers: {
          ...(this.ZeroExSdkOptions?.apiKey && {
            '0x-api-key': this.ZeroExSdkOptions?.apiKey,
          }),
        },
      });
      await validateResponse(response);
      const data: RfqmQuote = await response.json();
      return data;
    }

    const url = `${endpoint}/swap/v1/quote?${qs.stringify(params)}`;
    const response = await fetchFn(url);

    await validateResponse(response);

    const data: SwapQuote = await response.json();

    return data;
  }

  approveToken = async ({
    tokenContractAddress,
    contractAddressToApprove,
    amount,
    txOptions,
  }: {
    tokenContractAddress: string;
    contractAddressToApprove: string;
    amount?: BigNumberish;
    txOptions?: TransactionOverrides;
  }) => {
    const erc20 = Erc20__factory.connect(tokenContractAddress, this.signer);
    const tx = erc20.approve(contractAddressToApprove, amount ?? MaxInt256, {
      ...txOptions,
    });

    return tx;
  };

  getAllowance = async ({
    tokenContractAddress,
    contractAddressToApprove,
    walletAddress,
  }: {
    tokenContractAddress: string;
    contractAddressToApprove: string;
    walletAddress: string;
  }) => {
    const erc20 = Erc20__factory.connect(tokenContractAddress, this.provider);

    if (tokenContractAddress.toLowerCase() === ETH_FAKE_ADDRESS) {
      return MaxUint256;
    }

    const approvalAmount = await erc20.allowance(
      walletAddress,
      contractAddressToApprove
    );

    return approvalAmount;
  };

  /**
   * Submits the ERC-20 token swap on chain
   * @param quote - The data returned from getFirmQuote()
   * @returns The transaction response
   */
  async fillOrder(quote: SwapQuote): Promise<TransactionResponse> {
    if (!quote) {
      throw new Error(`No quote data provided!`);
    }

    const txResponse = await this.signer.sendTransaction({
      to: quote.to,
      data: quote.data,
      gasLimit: quote.gas,
      gasPrice: quote.gasPrice,
      value: quote.value,
      chainId: this.chainId,
    });

    return txResponse;
  }

  /**
   * Signs the RFQm order and submits it to authorize 0x to perform the swap on behalf of signers
   * - {@link https://docs.0x.org/market-makers/guides/signing-0x-orders}
   * - {@link https://docs.0x.org/market-makers/docs/introduction#rfq-m-1}
   * @param quote - The data returned from getFirmQuote()
   * @param fetchFn: An optional fetch function.
   * @returns The transaction response after RFQm fill submission
   */
  async fillRfqmOrder(
    quote: RfqmQuote,
    fetchFn = fetch
  ): Promise<PostRfqmTransactionSubmitSerializedResponse> {
    if (!quote) {
      throw new Error(`No quote data provided!`);
    }

    const rawSignature = await this.signer.signMessage(
      arrayify(quote.orderHash)
    );
    const { v, r, s } = splitSignature(rawSignature);
    const unpackedSignedSignature = {
      v,
      r,
      s,
      signatureType: 3,
    };

    const endpoint =
      this.ZeroExSdkOptions?.apiUrl ?? getRootApiEndpoint(this.chainId);
    const url = `${endpoint}/rfqm/v1/submit`;
    const body = {
      signature: unpackedSignedSignature,
      order: quote.order,
      type: RfqmTypes.OtcOrder,
    };

    const response = await fetchFn(url, {
      method: 'POST',
      headers: {
        ...(this.ZeroExSdkOptions?.apiKey && {
          '0x-api-key': this.ZeroExSdkOptions?.apiKey,
          'Content-Type': 'application/json',
        }),
      },
      body: JSON.stringify(body),
    });

    await validateResponse(response);

    const data: PostRfqmTransactionSubmitSerializedResponse = await response.json();

    return data;
  }

  /**
   * Fetches the RFQm order transaction status
   * @param txHash: The order transaction hash from RFQm fill submission
   * @param fetchFn: An optional fetch function.
   * @returns The transaction status and all transactions executed for the RFQm order
   */
  async getRfqmTxStatus(
    txHash: string,
    fetchFn = fetch
  ): Promise<RfqmTransactionStatusResponse> {
    if (!txHash) {
      throw new Error(`Transaction hash not provided!`);
    }

    const endpoint =
      this.ZeroExSdkOptions?.apiUrl ?? getRootApiEndpoint(this.chainId);
    const statusUrl = `${endpoint}/rfqm/v1/status/${txHash}`;
    const response = await fetchFn(statusUrl, {
      headers: {
        ...(this.ZeroExSdkOptions?.apiKey && {
          '0x-api-key': this.ZeroExSdkOptions?.apiKey,
        }),
      },
    });
    const data: RfqmTransactionStatusResponse = await response.json();

    return data;
  }
}

export { ZeroExSdk };
