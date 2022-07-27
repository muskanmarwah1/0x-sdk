# 0x-sdk

0x SDK is a TypeScript SDK for building exchange functionality on Ethereum and EVM-compatible chains. 0x SDK uses [0x API](https://github.com/0xProject/0x-sdk) to aggregate liquidity. Building exchange functionality with the 0x API requires integrators to go through a number of steps. Integrators may need to manage chain IDs, API endpoints, convert numbers, approve tokens, sign messages, communicate with smart contracts, etc. The 0x SDK aims to simplify these steps.

## Installation

```
npm install @0x/0x-sdk

# or

yarn add @0x/0x-sdk
```

## Usage

Swap tokens with the 0x SDK:

```ts
import { ZeroExSdk } from '@0x/0x-sdk';

// Instantiate SDK
const sdk = new ZeroExSdk(chainId, provider, signer);
const takerAddress = await signer.getAddress();

// Request params for the `/swap` resource to swap 1 WETH for DAI
const params = {
  sellToken: WETH_ADDRESS,
  buyToken: DAI_ADDRESS,
  sellAmount: '100000000000000000',
  takerAddress,
};

// Get price to swap 1 WETH for DAI
const price = await sdk.getIndicativePrice({
  resource: 'swap',
  params,
});

// Get firm quote to swap 1 WETH for DAI
const quote = await sdk.getFirmQuote({
  resource: 'swap',
  params,
});

// Approve ZeroEx Exchange Proxy to spend WETH
const contractTx = await sdk.approveToken({
  tokenContractAddress: WETH_ADDRESS,
  contractAddressToApprove: ZEROEX_CONTRACT_ADDRESS,
});

await contractTx.wait();

// Submit the quote to ZeroEx Exchange Proxy
const txResponse = await sdk.fillOrder(quote);

// Wait for the transaction to be mined
const { transactionHash } = await txResponse.wait();
```

## Development

1. Install dependencies, generate types, and run build

```
yarn
```

2. Run tests

```
yarn test
```

## Release

Releases are automated with Google's [release-please](https://github.com/googleapis/release-please) GitHub action. Simply merge the [release pull request](https://github.com/googleapis/release-please#whats-a-release-pr) (PR) to publish a release 🚀.

The GitHub action parses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to help automate releases. It creates a release PR that is kept up-to-date as additional commits are merged. The release PR can be merged once maintainers are ready to publish the release. Merging the release PR triggers the action to:

1) Update the `CHANGELOG.md` and `package.json` 
2) Tag the commit with the [version](https://semver.org/)
3) Create a GitHub release based on the tag
4) Publish [the package](https://www.npmjs.com/package/@0x/0x-sdk) to npm
