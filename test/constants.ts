import { config } from 'dotenv';

config();

export const GOERLI_RPC_TESTNET = `https://eth-goerli.alchemyapi.io/v2/${process.env.GOERLI_ALCHEMY_API_KEY}`;

export const ROPSTEN_RPC_TESTNET = `https://eth-ropsten.alchemyapi.io/v2/${process.env.ROPSTEN_ALCHEMY_API_KEY}`;
