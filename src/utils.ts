import { ROOT_STAGING_URL, ROOT_URLS_BY_CHAIN_ID } from './constants';
import {
  SwapParams,
  RequestError,
  RfqmBackendHealthcheckStatusResponse,
} from './types';

export const getRootApiEndpoint = (chainId: number | string): string => {
  if (typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'test') {
      return ROOT_STAGING_URL;
    }
  }

  const apiUrl = ROOT_URLS_BY_CHAIN_ID[parseInt(chainId.toString(10))];

  if (!apiUrl) {
    throw new Error(`No API Url for ${chainId}.`);
  }

  return apiUrl;
};

export const validateAmounts = (params: SwapParams) => {
  if (params.buyAmount && params.sellAmount) {
    throw Error(
      'The swap request params requires either a sellAmount or buyAmount. Do not provide both fields.'
    );
  }

  if (!params.buyAmount && !params.sellAmount) {
    throw Error(
      'The swap request params requires either a sellAmount or buyAmount.'
    );
  }

  return undefined;
};

export const validateResponse = async (response: Response) => {
  if (response.status > 400) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  if (response.status === 400) {
    const causes: string[] = [];
    const data: RequestError = await response.json();

    data.validationErrors.map(error => {
      const { field, reason } = error;
      causes.push(`${field}: ${reason}.`);

      return undefined;
    });

    const message = `[${data.reason}] ${causes.join(' ')}`;

    throw new Error(message);
  }

  return undefined;
};

export const verifyRfqmIsLiveOrThrow = async (
  endpoint: string,
  fetchFn = fetch
) => {
  const healthUrl = `${endpoint}/rfqm/v1/healthz`;
  const healthResponse = await fetchFn(healthUrl);
  const parsedHealthResponse: RfqmBackendHealthcheckStatusResponse = await healthResponse.json();

  if (!parsedHealthResponse?.isOperational) {
    throw new Error(`RFQm service is down.`);
  }

  return undefined;
};
