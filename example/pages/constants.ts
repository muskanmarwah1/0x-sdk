interface token {
  id: string;
  symbol: string;
  name: string;
  image: string;
  addresses: Record<string, string>;
}

export const ONE_ETHER_BASE_UNITS = 1e18; // 1 ETH

export const WETH: token = {
  id: 'wrappedEthereum',
  symbol: 'weth',
  name: 'Wrapped Ethereum',
  image:
    'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
  addresses: {
    1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    3: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    137: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  },
};

export const DAI: token = {
  id: 'dai',
  symbol: 'DAI',
  name: 'Dai',
  image:
    'https://assets.coingecko.com/coins/images/9956/large/4943.png?1636636734',
  addresses: {
    1: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    3: '0xaD6D458402F60fD3Bd25163575031ACDce07538D',
    137: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  },
};

export const ZEROEX_CONTRACT_ADDRESS =
  '0xdef1c0ded9bec7f1a1670819833240f027b25eff';
