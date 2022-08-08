import Head from 'next/head';
import Image from 'next/image';
import { ZeroExSdk } from '@0x/0x-sdk';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useRef, useEffect } from 'react';
import {
  useAccountModal,
  useAddRecentTransaction,
} from '@rainbow-me/rainbowkit';
import { useAccount, useNetwork, useProvider, useSigner } from 'wagmi';
import { SwapPrice } from '@0x/0x-sdk/dist/types';
import { requestPrice, processTransaction } from './handlers';
import { WETH, DAI } from './constants';
import styles from '../styles/Home.module.css';
import { formatUnits } from 'ethers/lib/utils';

function Home() {
  const sdkRef = useRef<ZeroExSdk>();
  const [sellAmount, setSellAmount] = useState('0');
  const [price, setPrice] = useState<SwapPrice>();
  const provider = useProvider();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const addRecentTransaction = useAddRecentTransaction();
  const { openAccountModal } = useAccountModal();

  useEffect(() => {
    if (chain && signer) {
      sdkRef.current = new ZeroExSdk(chain.id, provider, signer);
    }
  }, [signer, provider, chain]);

  return (
    <div className={styles.body}>
      <Head>
        <title>0x SDK Example</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ConnectButton />
      <div className={styles.card}>
        <h4>Swap Token</h4>
        <div className={styles.coinmodule}>
          <Image
            className={styles.image}
            src={WETH.image}
            alt="wrapped ethereum"
            width="24"
            height="24"
          />
          <div>WETH</div>
          <label hidden htmlFor="sell-amount">
            sell amount in WETH
          </label>
          <input
            id="sell-amount"
            type="text"
            placeholder="Amount"
            onChange={event => {
              requestPrice({ event, sdkRef, address, setPrice, setSellAmount });
            }}
          />
        </div>
      </div>
      <div>&darr;</div>
      <div className={styles.card}>
        <h4>Buy Token</h4>
        <div className={styles.coinmodule}>
          <Image
            className={styles.image}
            src={DAI.image}
            alt="dai"
            width="24"
            height="24"
          />
          <div>DAI</div>
          <label hidden htmlFor="buy-amount">
            buy token in dai
          </label>
          <input
            readOnly
            type="text"
            id="buy-amount"
            value={price ? formatUnits(price?.buyAmount, 18) : ''}
          />
        </div>
      </div>
      <button
        onClick={() => {
          processTransaction({
            chain,
            sdkRef,
            address,
            sellAmount,
            openAccountModal,
            addRecentTransaction,
          });
        }}
        type="button"
      >
        Submit
      </button>
    </div>
  );
}


export default Home;
