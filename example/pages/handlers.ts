import { ChangeEvent, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { ZeroExSdk } from '@0x/0x-sdk';
import type { Chain } from 'wagmi';
import type { NewTransaction } from '@rainbow-me/rainbowkit/dist/transactions/transactionStore';
import { SwapPrice, SwapParams, SwapQuote } from '@0x/0x-sdk/dist/types';
import { ZEROEX_CONTRACT_ADDRESS, WETH } from './constants';
import { parseUnits } from 'ethers/lib/utils';

const swapTokens: SwapParams = {
  sellToken: 'weth',
  buyToken: 'dai',
};

export async function requestPrice({
  event,
  sdkRef,
  setPrice,
  setSellAmount,
  address,
}: {
  event: ChangeEvent<HTMLInputElement>;
  sdkRef: MutableRefObject<ZeroExSdk | undefined>;
  setPrice: Dispatch<SetStateAction<SwapPrice | undefined>>;
  setSellAmount: Dispatch<SetStateAction<string>>;
  address: string | undefined;
}) {
  const parsedSellAmount = parseUnits(event.target.value, 18).toString();
  const params = {
    ...swapTokens,
    sellAmount: parsedSellAmount,
    takerAddress: address,
  };

  setSellAmount(parsedSellAmount);

  if (parseFloat(event.target.value) > 0 && sdkRef.current) {
    const price = await sdkRef.current.getIndicativePrice({
      resource: 'swap',
      params,
    });
    setPrice(price as SwapPrice);
  }
}

export async function processTransaction({
  sellAmount,
  sdkRef,
  chain,
  address,
  addRecentTransaction,
  openAccountModal,
}: {
  sellAmount: string;
  sdkRef: MutableRefObject<ZeroExSdk | undefined>;
  chain?: Chain;
  address?: string;
  addRecentTransaction: (transaction: NewTransaction) => void;
  openAccountModal?: (() => void) | undefined;
}) {
  const params = {
    sellToken: 'weth',
    buyToken: 'dai',
    sellAmount,
    takerAddress: address,
  };

  if (sdkRef.current && chain && address) {
    const quote = await sdkRef.current.getFirmQuote({
      resource: 'swap',
      params,
    });

    //Approve ZeroEx Exchange Proxy to spend WETH
    const allowance = await sdkRef.current?.getAllowance({
      tokenContractAddress: WETH.addresses[chain.id],
      contractAddressToApprove: ZEROEX_CONTRACT_ADDRESS,
      walletAddress: address,
    });

    // Approve Token only if it hasn't been approved before.
    if (allowance?.toString() === '0') {
      const contractTx = await sdkRef.current?.approveToken({
        tokenContractAddress: WETH.addresses[chain.id],
        contractAddressToApprove: ZEROEX_CONTRACT_ADDRESS,
      });
      await contractTx.wait();
    }
    // Adding additional gas to ensure txn gets processed.
    quote.gas = Math.round(parseInt(quote.gas, 10) * 1.5).toString();

    // Submit the quote to ZeroEx Exchange Proxy
    const txResponse = await sdkRef.current?.fillOrder(quote as SwapQuote);

    //Add txn to user's history via Rainbow Kit and open Account Modal to view details.
    if (txResponse) {
      addRecentTransaction({
        hash: txResponse.hash,
        description: `${txResponse.hash.substring(
          0,
          4
        )}...${txResponse.hash.substring(
          txResponse.hash.length - 5,
          txResponse.hash.length - 1
        )}`,
        confirmations: 1,
      });
      openAccountModal && openAccountModal();
    }
  }
}
