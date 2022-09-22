export const ETH_FAKE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const DAI_CONTRACT_ADDRESS_MAINNET =
  '0x6b175474e89094c44da98b954eedeac495271d0f';

export const ROOT_STAGING_URL = 'https://staging.api.0x.org';

export const ROOT_URLS_BY_CHAIN_ID: { [key: string]: string } = {
  '1': 'https://api.0x.org',
  '3': 'https://ropsten.api.0x.org',
  '137': 'https://polygon.api.0x.org',
  '56': 'https://bsc.api.0x.org',
  '10': 'https://optimism.api.0x.org',
  '250': 'https://fantom.api.0x.org',
  '42220': 'https://celo.api.0x.org',
  '43114': 'https://avalanche.api.0x.org',
};

export const CHAIN_IDS = {
  MAINNET: 1,
  ROPSTEN: 3,
  GOERLI: 5,
  OPTIMISM: 10,
  BSC: 56,
  POLYGON: 137,
  FANTOM: 250,
  CELO: 42220,
  AVALANCHE: 43114,
};

export const EXCHANGE_PROXY_ADDRESSES: Record<number, string> = {
  1: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
  5: '0xf91bb752490473b8342a3e964e855b9f9a2a668e',
  10: '0xdef1abe32c034e558cdd535791643c58a13acc10',
  56: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
  137: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
  250: '0xdef189deaef76e379df891899eb5a00a94cbc250',
  42220: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
  43114: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
};
