import { Wallet } from '@ethersproject/wallet';
import { MaxInt256 } from '@ethersproject/constants';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { ZeroExSdk } from '../src';
import { ZEROEX_CONTRACT_ADDRESS } from '../src/constants';
import { GOERLI_RPC_TESTNET } from './constants';

// Sometimes it takes a minute or two to mine a block on a testnet
jest.setTimeout(120 * 1000);

describe('ZeroExSdk: erc20 approval and allowance', () => {
  it('approves erc20 and gets allowance amount', async () => {
    const WETH_GOERLI_ADDRESS = '0xb7e94Cce902E34e618A23Cb82432B95d03096146';
    const WALLET_PUBLIC_ADDRESS = '0xbbb5b49Db0cCb930f6E56A48eDC3e2C26Dbf6Fe2';
    const WALLET_PRIVATE_KEY =
      'ebc9ecb342624853540531f439a917b889bdf7730fa84f226657831f806b0677';
    const GOERLI_PROVIDER = new StaticJsonRpcProvider(GOERLI_RPC_TESTNET);
    const WALLET = new Wallet(WALLET_PRIVATE_KEY);
    const GOERLI_SIGNER = WALLET.connect(GOERLI_PROVIDER);
    const sdk = new ZeroExSdk();
    const tx = await sdk.approveToken({
      tokenContractAddress: WETH_GOERLI_ADDRESS,
      contractAddressToApprove: ZEROEX_CONTRACT_ADDRESS,
      signer: GOERLI_SIGNER,
    });
    const { transactionHash } = await tx.wait();

    expect(transactionHash).toBeTruthy();

    const allowance = await sdk.getAllowance({
      tokenContractAddress: WETH_GOERLI_ADDRESS,
      contractAddressToApprove: ZEROEX_CONTRACT_ADDRESS,
      walletAddress: WALLET_PUBLIC_ADDRESS,
      signerOrProvider: GOERLI_PROVIDER,
    });

    expect(allowance).toStrictEqual(MaxInt256);
  });
});
