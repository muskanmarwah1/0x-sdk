import { Overrides } from '@ethersproject/contracts';
import { BaseProvider, TransactionRequest } from '@ethersproject/providers';
import { BigNumberish, Signer } from 'ethers';

export interface ZeroExSdkOptions {
  apiUrl?: string;
  apiUrls?: { [key: number]: string };
  apiKey?: string;
}

export type ResourceType = 'swap' | 'rfqm';

export interface FetchPriceOrQuoteArgs {
  params: SwapParams;
  chainId?: number;
  resource?: ResourceType;
  fetchFn?: Function;
}

export interface RfqmTxStatusArgs {
  txHash: string;
  chainId?: number;
  fetchFn?: Function;
}

export interface FillOrderArgs {
  quote: SwapQuote;
  chainId: number;
  signer: Signer;
  txOptions?: TransactionRequest;
}

export interface FillRfqmOrderArgs extends Omit<FillOrderArgs, 'quote'> {
  quote: RfqmQuote;
  fetchFn?: Function;
}

interface PriceComparison {
  name: string;
  price: string | null;
  gas: string | null;
}
interface Order {
  makerToken: string;
  takerToken: string;
  makerAmount: string;
  takerAmount: string;
  fillData: {
    tokenAddressPath: string[];
    router: string;
  };
  source: string;
  sourcePathId: string;
  type: number;
}

interface LiquiditySource {
  name: string;
  proportion: string;
}

export enum RfqmTypes {
  MetaTransaction = 'metatransaction',
  OtcOrder = 'otc',
}
export interface SerializedExchangeProxyRfqm {
  makerToken: string;
  takerToken: string;
  makerAmount: string;
  takerAmount: string;
  maker: string;
  taker: string;
  txOrigin: string;
  expiryAndNonce: string;
  verifyingContract: string;
  chainId: number;
  domain: EIP712DomainWithDefaultSchema;
}

export interface EIP712DomainWithDefaultSchema {
  name?: string;
  version?: string;
  chainId: number;
  verifyingContract: string;
}
export interface SwapParams {
  sellToken?: string;
  buyToken?: string;
  sellAmount?: string;
  buyAmount?: string;
  takerAddress?: string;
  slippagePercentage?: number;
  gasPrice?: string;
  excludedSources?: string[];
  affiliateAddress?: string;
  skipValidation?: boolean;
  includePriceComparisons?: boolean;
  includedSources?: string[];
}

export interface SwapPrice {
  price: string;
  to: string;
  gasPrice: string;
  protocolFee: string;
  orders: Order[];
  buyAmount: string;
  sellAmount: string;
  buyTokenAddress: string;
  sellTokenAddress: string;
  value: string;
  sources: LiquiditySource[];
  gas: string;
  minimumProtocolFee: string;
  estimatedGas: string;
  estimatedGasTokenRefund: string;
  priceComparisons?: PriceComparison[];
  allowanceTarget: string;
  from?: string;
  buyTokenToEthRate?: string;
  sellTokenToEthRate?: string;
}

export interface RfqmPrice {
  price: string;
  buyAmount: string;
  sellAmount: string;
  buyTokenAddress: string;
  sellTokenAddress: string;
  allowanceTarget: string;
  liquidityAvailable: boolean;
  gas: string;
}

type RfqmPairs = string[];
export interface RfqmBackendHealthcheckStatusResponse {
  isOperational: boolean;
  pairs: RfqmPairs[];
}
export interface SwapQuote extends SwapPrice {
  data: string;
}
export interface RfqmQuote extends RfqmPrice {
  order: SerializedExchangeProxyRfqm;
  orderHash: string;
  type: RfqmTypes.OtcOrder;
}

export interface PostRfqmTransactionSubmitSerializedResponse {
  metaTransactionHash: string;
  orderHash: string;
  type: RfqmTypes.OtcOrder;
}

export enum RfqmTransactionStates {
  Pending = 'pending',
  Submitted = 'submitted',
  Failed = 'failed',
  Succeeded = 'succeeded',
  Confirmed = 'confirmed',
}
export interface RfqmTransactionStatusResponse {
  status: RfqmTransactionStates;
  transactions: { hash: string; timestamp: number }[];
}

export interface ApproveTokenParams {
  tokenContractAddress: string;
  contractAddressToApprove: string;
  signer: Signer;
  amount?: BigNumberish;
  txOptions?: TransactionOverrides;
}

export interface AllowanceParams {
  tokenContractAddress: string;
  contractAddressToApprove: string;
  walletAddress: string;
  signerOrProvider: BaseProvider | Signer;
}

export interface SwapSourceParams {
  chainId?: number;
  fetchFn?: Function;
}

export interface SwapSourcesResponse {
  records: string[];
}

interface ValidationError {
  field: string;
  code: number;
  reason: string;
}

export interface RequestError {
  code: number;
  reason: string;
  validationErrors?: ValidationError[];
}

export type TransactionOverrides = Overrides & {
  from?: string | Promise<string>;
};
