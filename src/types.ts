import { Overrides } from '@ethersproject/contracts';

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

export interface SwapParams {
  sellToken?: string;
  buyToken?: string;
  sellAmount?: string;
  buyAmount?: string;
  takerAddress?: string;
  sellingAmount?: string;
  buyingAmount?: string;
  slippagePercentage?: number;
  gasPrice?: string;
  excludedSources?: string[];
  affiliateAddress?: string;
  skipValidation?: boolean;
  includePriceComparisons?: boolean;
  includedSources?: string[];
}

export interface Price {
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

export interface Quote extends Price {
  data: string;
}

interface ValidationError {
  field: string;
  code: number;
  reason: string;
}

export interface RequestError {
  code: number;
  reason: string;
  validationErrors: ValidationError[];
}

export type TransactionOverrides = Overrides & {
  from?: string | Promise<string>;
};
