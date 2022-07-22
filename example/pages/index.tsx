import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from '../styles/Home.module.css'
import Head from 'next/head'

const ETH = {
  id: "ethereum",
  symbol: "eth",
  name: "Ethereum",
  image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880",
};

const USDC = {
  id: "usd-coin",
  symbol: "usdc",
  name: "USD Coin",
  image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
};

const DAI = {
  id: "dai",
  symbol: "DAI",
  name: "Dai",
  image: "https://assets.coingecko.com/coins/images/9956/large/4943.png?1636636734",
};

const MATIC = {
  id: "matic-network",
  symbol: "matic",
  name: "Polygon",
  image: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912",
}

function Home() {
  return (
    <div className={styles.body}>
      <Head>
        <title>0x SDK Example</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ConnectButton />
      <div className={styles.card} >
        <h4><b>Swap Token</b></h4>
        <div className={styles.coinmodule}>
          <img className={styles.image} id='sellTokenIcon' src={ETH.image} alt="ethereum" ></img>
          <label hidden htmlFor="tokenOptionSell">sell token</label>
          <select id='tokenOptionSell'>
            <option key="eth" value="eth">ETH</option>
            <option key="dai" value="dai">DAI</option>
            <option key="matic" value="matic">MATIC</option>
          </select>
          <label hidden htmlFor="amountToSell">sell amount</label>
          <input id='amountToSell' type='text' placeholder='Amount' />
        </div>
        <div>
          <h5>Current Balance: 99.99</h5>
        </div>
      </div>
      <div>&darr;</div>
      <div className={styles.card}>
        <h4><b>Buy Token</b></h4>
        <div className={styles.coinmodule}>
          <img className={styles.image} src={MATIC.image} alt="matic" ></img>
          <label hidden htmlFor="tokenOptionBuy">buy token</label>
          <select
            id='tokenOptionBuy'>
            <option key="eth" value="eth">ETH</option>
            <option key="dai" value="dai">DAI</option>
            <option key="matic" value="matic">MATIC</option>
          </select>
          <button type="button">Quote</button>
        </div>
        <div>
          <h5>Quoted Amount: 99.99 MATIC</h5>
        </div>
      </div>
    </div>
  )
};

export default Home;

