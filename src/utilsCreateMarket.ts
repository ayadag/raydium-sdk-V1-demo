import {
  MarketV2,
  Token,
} from '@raydium-io/raydium-sdk';
import { Keypair } from '@solana/web3.js';

import {
  connection,
  DEFAULT_TOKEN,
  makeTxVersion,
  PROGRAMIDS,
  wallet,
} from '../config';
import { buildAndSendTx } from './util';

type TestTxInputInfo = {
  baseToken: Token
  quoteToken: Token
  wallet: Keypair
}

export async function createMarket(input: TestTxInputInfo) {
  // -------- step 1: make instructions --------
  const createMarketInstruments = await MarketV2.makeCreateMarketInstructionSimple({
    connection,
    wallet: input.wallet.publicKey,
    baseInfo: input.baseToken,
    quoteInfo: input.quoteToken,
    lotSize: 0.1, // default 1
    tickSize: 0.00001, // default 0.01
    dexProgramId: PROGRAMIDS.OPENBOOK_MARKET,
    makeTxVersion,
  })

  const marketId = createMarketInstruments.address.marketId
  console.log('marketId', marketId)

  // return { txids: await buildAndSendTx(createMarketInstruments.innerTransactions) }

  return { txids: await buildAndSendTx(createMarketInstruments.innerTransactions, { skipPreflight: true }) }
}

async function howToUse() {
  const baseToken = DEFAULT_TOKEN.SALD // RAY
  const quoteToken = DEFAULT_TOKEN.WSOL // USDC

  createMarket({
    baseToken,
    quoteToken,
    wallet: wallet,
  }).then(({ txids }) => {
    /** continue with txids */
    console.log('txids', txids)
  })
};

howToUse();
