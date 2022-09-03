# 0x-sdk

0x SDK is a TypeScript SDK for building exchange functionality on Ethereum and EVM-compatible chains. 0x SDK uses [0x API](https://github.com/0xProject/0x-sdk) to aggregate liquidity. Building exchange functionality with the 0x API requires integrators to go through a number of steps. Integrators may need to manage chain IDs, API endpoints, convert numbers, approve tokens, sign messages, communicate with smart contracts, etc. The 0x SDK aims to simplify these steps.

## Installation

```
npm install @0x/0x-sdk

# or

yarn add @0x/0x-sdk
```

## Usage

Swap tokens with the 0x-sdk:

```ts
import { ZeroExSdk } from '@0x/0x-sdk';

// Instantiate SDK
const sdk = new ZeroExSdk();
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
  chainId,
});

// Get firm quote to swap 1 WETH for DAI
const quote = await sdk.getFirmQuote({
  resource: 'swap',
  params,
  chainId,
});

// Approve ZeroEx Exchange Proxy to spend WETH
const contractTx = await sdk.approveToken({
  tokenContractAddress: WETH_ADDRESS,
  contractAddressToApprove: ZEROEX_CONTRACT_ADDRESS,
  signer,
});

await contractTx.wait();

// Submit the quote to ZeroEx Exchange Proxy
const txResponse = await sdk.fillOrder({ quote, signer, chainId });

// Wait for the transaction to be mined
const { transactionHash } = await txResponse.wait();
```

## Example

This repository includes a basic example in the `[/examples](/examples)` folder which demonstrates basic exchange functionality. Follow these instructions to run the example:

1. Navigate to the `/example` folder

```
cd /example
```

2. Install the dependencies

```
yarn
```

3. Run the example app

```
yarn dev
```

## Contributing

Please follow this project's [contributing guidelines](./.github/contributing.md).
