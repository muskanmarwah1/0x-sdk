import { BigNumber } from '@ethersproject/bignumber';
import { MaxInt256, MaxUint256 } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { arrayify, splitSignature } from '@ethersproject/bytes';
import { ContractTransaction } from '@ethersproject/contracts';
import fetch from 'isomorphic-unfetch';
import qs from 'qs';
import { ETH_FAKE_ADDRESS } from './constants';
import { Erc20__factory } from './contracts';
import {
  ZeroExSdkOptions,
  FetchPriceOrQuoteArgs,
  SwapPrice,
  RfqmPrice,
  RfqmQuote,
  SwapQuote,
  PostRfqmTransactionSubmitSerializedResponse,
  RfqmTransactionStatusResponse,
  RfqmTypes,
  ApproveTokenParams,
  AllowanceParams,
  RfqmTxStatusArgs,
  FillRfqmOrderArgs,
  FillOrderArgs,
  SwapSourcesResponse,
  SwapSourceParams,
} from './types';
import {
  validateAmounts,
  validateResponse,
  getRootApiEndpoint,
  verifyRfqmIsLiveOrThrow,
} from './utils';
import {
  ERROR_CHAIN_ID_REQUIRED,
  ERROR_CHAIN_ID_URL_REQUIRED,
  ERROR_QUOTE_REQUIRED,
  ERROR_SIGNER_REQUIRED,
  ERROR_TX_HASH_REQUIRED,
} from './errors';

class ZeroExSdk {
  private ZeroExSdkOptions?: ZeroExSdkOptions;

  constructor(ZeroExSdkOptions?: ZeroExSdkOptions) {
    this.ZeroExSdkOptions = ZeroExSdkOptions;
  }

  /**
   * Returns the liquidity sources enabled for a specific chain id.
   * - {@link https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-sources}
   *
   * @param chainId - Chain ID of sources. Optional if ZeroExSdkOptions.apiUrl is defined
   * @param fetchFn: An optional fetch function. Defaults to fetch.
   * @returns An object with the list of sources
   */
  async getSources({
    chainId,
    fetchFn = fetch,
  }: SwapSourceParams = {}): Promise<SwapSourcesResponse> {
    const endpoint = chainId
      ? getRootApiEndpoint(chainId)
      : this.ZeroExSdkOptions?.apiUrl;

    if (!endpoint) {
      throw new Error(ERROR_CHAIN_ID_URL_REQUIRED);
    }

    const url = `${endpoint}/swap/v1/sources`;
    const response = await fetchFn(url);
    await validateResponse(response);
    const data: SwapSourcesResponse = await response.json();
    return data;
  }

  /**
   * Fetches an indicative price for buying or selling an ERC20 token.
   * - {@link https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-price}
   * - {@link https://docs.0x.org/market-makers/docs/introduction#indicative-pricing}
   *
   * @param params: The request params for the 0x API `/price` endpoint.
   * @param resource: Optional 'swap' or 'rfqm' resource type. Defaults to 'swap'.
   * @param chainId - Chain ID number for this transaction. Optional if ZeroExSdkOptions.apiUrl is defined
   * @param fetchFn: An optional fetch function. Defaults to fetch.
   * @returns The indicative price
   */
  async getIndicativePrice({
    params,
    resource = 'swap',
    chainId,
    fetchFn = fetch,
  }: FetchPriceOrQuoteArgs): Promise<SwapPrice | RfqmPrice> {
    validateAmounts(params);
    const endpoint = chainId
      ? getRootApiEndpoint(chainId)
      : this.ZeroExSdkOptions?.apiUrl;

    if (!endpoint) {
      throw new Error(ERROR_CHAIN_ID_URL_REQUIRED);
    }

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
   * @param resource: Optional 'swap' or 'rfqm' resource type. Defaults to 'swap'.
   * @param chainId - Chain ID number for this transaction. Optional if ZeroExSdkOptions.apiUrl is defined
   * @param fetchFn: An optional fetch function.
   * @returns The firm quote
   */
  async getFirmQuote({
    params,
    resource = 'swap',
    chainId,
    fetchFn = fetch,
  }: FetchPriceOrQuoteArgs): Promise<SwapQuote | RfqmQuote> {
    validateAmounts(params);
    const endpoint = chainId
      ? getRootApiEndpoint(chainId)
      : this.ZeroExSdkOptions?.apiUrl;

    if (!endpoint) {
      throw new Error(ERROR_CHAIN_ID_URL_REQUIRED);
    }

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

  async approveToken({
    tokenContractAddress,
    contractAddressToApprove,
    signer,
    amount,
    txOptions,
  }: ApproveTokenParams): Promise<ContractTransaction> {
    const erc20 = Erc20__factory.connect(tokenContractAddress, signer);
    const tx = erc20.approve(contractAddressToApprove, amount ?? MaxInt256, {
      ...txOptions,
    });

    return tx;
  }

  async getAllowance({
    tokenContractAddress,
    contractAddressToApprove,
    walletAddress,
    signerOrProvider,
  }: AllowanceParams): Promise<BigNumber> {
    const erc20 = Erc20__factory.connect(
      tokenContractAddress,
      signerOrProvider
    );

    if (tokenContractAddress.toLowerCase() === ETH_FAKE_ADDRESS) {
      return MaxUint256;
    }

    const approvalAmount = await erc20.allowance(
      walletAddress,
      contractAddressToApprove
    );

    return approvalAmount;
  }

  /**
   * Submits the ERC-20 token swap on chain
   * @param quote - The data returned from getFirmQuote()
   * @param signer - Signer who will send the transaction
   * @param chainId - Chain ID number for this transaction.
   * @returns The transaction response
   */
  async fillOrder({
    quote,
    signer,
    chainId,
    txOptions,
  }: FillOrderArgs): Promise<TransactionResponse> {
    if (!quote) throw new Error(ERROR_QUOTE_REQUIRED);
    if (!signer) throw new Error(ERROR_SIGNER_REQUIRED);
    if (!chainId) throw new Error(ERROR_CHAIN_ID_REQUIRED);

    const txResponse = await signer.sendTransaction({
      gasLimit: quote.gas,
      gasPrice: quote.gasPrice,
      ...(txOptions || {}),
      // don't override with options
      to: quote.to,
      data: quote.data,
      value: quote.value,
      chainId,
    });

    return txResponse;
  }

  /**
   * Signs the RFQm order and submits it to authorize 0x to perform the swap on behalf of signers
   * - {@link https://docs.0x.org/market-makers/guides/signing-0x-orders}
   * - {@link https://docs.0x.org/market-makers/docs/introduction#rfq-m-1}
   * @param quote - The data returned from getFirmQuote()
   * @param chainId: Chain ID number for this transaction.
   * @param fetchFn: An optional fetch function.
   * @returns The transaction response after RFQm fill submission
   */
  async fillRfqmOrder({
    quote,
    chainId,
    signer,
    fetchFn = fetch,
  }: FillRfqmOrderArgs): Promise<PostRfqmTransactionSubmitSerializedResponse> {
    if (!quote) {
      throw new Error(ERROR_QUOTE_REQUIRED);
    }

    const rawSignature = await signer.signMessage(arrayify(quote.orderHash));
    const { v, r, s } = splitSignature(rawSignature);
    const unpackedSignedSignature = {
      v,
      r,
      s,
      signatureType: 3,
    };

    const endpoint = chainId
      ? getRootApiEndpoint(chainId)
      : this.ZeroExSdkOptions?.apiUrl;
    if (!endpoint) throw new Error(ERROR_CHAIN_ID_URL_REQUIRED);

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
   * @param chainId: Chain ID number for this transaction.
   * @param fetchFn: An optional fetch function.
   * @returns The transaction status and all transactions executed for the RFQm order
   */
  async getRfqmTxStatus({
    txHash,
    chainId,
    fetchFn = fetch,
  }: RfqmTxStatusArgs): Promise<RfqmTransactionStatusResponse> {
    if (!txHash) {
      throw new Error(ERROR_TX_HASH_REQUIRED);
    }

    const endpoint = chainId
      ? getRootApiEndpoint(chainId)
      : this.ZeroExSdkOptions?.apiUrl;
    if (!endpoint) throw new Error(ERROR_CHAIN_ID_URL_REQUIRED);

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
