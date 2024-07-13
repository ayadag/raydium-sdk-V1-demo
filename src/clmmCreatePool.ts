import BN from 'bn.js';
import Decimal from 'decimal.js';

import {
  Clmm,
  ClmmConfigInfo,
  Token,
} from '@raydium-io/raydium-sdk';
import {
  Keypair,
  PublicKey,
} from '@solana/web3.js';

import {
  connection,
  DEFAULT_TOKEN,
  makeTxVersion,
  wallet,
} from '../config';
import { buildAndSendTx } from './util';

type TestTxInputInfo = {
  baseToken: Token
  quoteToken: Token
  clmmConfigId: string
  wallet: Keypair
  startPoolPrice: Decimal
  startTime: BN
}

const clmmProgram = new PublicKey('4sGSRSbf9QwFvy7LhDidtgw6kEyZzNvf4VDYEKhicenj'); //PROGRAMIDS.CLMM

async function clmmCreatePool(input: TestTxInputInfo) {
  // -------- pre-action: fetch basic ammConfig info --------
  // const _ammConfig = (await formatClmmConfigs(clmmProgram.toString()))[input.clmmConfigId]
  // const ammConfig: ClmmConfigInfo = { ..._ammConfig, id: new PublicKey(_ammConfig.id) }

  //////ayada////////
  let ammConfig: ClmmConfigInfo = {
    description: 'first config',
    fundFeeRate: 40000,
    fundOwner: '7CDdvccgvG6tSn93gLtoHNbCafFNgRw6m27nFxmuk4NR',
    id: new PublicKey(input.clmmConfigId),
    index: 1,
    protocolFeeRate: 120000,
    tickSpacing: 60,
    tradeFeeRate: 2500
  };
  // -------- step 1: make create pool instructions --------
  const makeCreatePoolInstruction = await Clmm.makeCreatePoolInstructionSimple({
    connection,
    programId: clmmProgram, //PROGRAMIDS.CLMM
    owner: input.wallet.publicKey,
    mint1: input.baseToken,
    mint2: input.quoteToken,
    ammConfig,
    initialPrice: input.startPoolPrice,
    startTime: input.startTime,
    makeTxVersion,
    payer: wallet.publicKey,
  })

  // -------- step 2: (optional) get mockPool info --------
  const mockPoolInfo = Clmm.makeMockPoolInfo({
    programId: clmmProgram, //PROGRAMIDS.CLMM
    mint1: input.baseToken,
    mint2: input.quoteToken,
    ammConfig,
    createPoolInstructionSimpleAddress: makeCreatePoolInstruction.address,
    owner: input.wallet.publicKey,
    initialPrice: input.startPoolPrice,
    startTime: input.startTime
  })

  return { txids: await buildAndSendTx(makeCreatePoolInstruction.innerTransactions), mockPoolInfo }
}

async function howToUse() {
  const baseToken = DEFAULT_TOKEN.SALD // USDC
  const quoteToken = DEFAULT_TOKEN.WSOL // RAY
  const clmmConfigId = 'CHHJQXc6wN8NA1GZvmDL58nWSuR4UndMx6UA4zYRv4Xm' //config account index =1
  const startPoolPrice = new Decimal(1)
  const startTime = new BN(Math.floor(new Date().getTime() / 1000))

  clmmCreatePool({
    baseToken,
    quoteToken,
    clmmConfigId,
    wallet: wallet,
    startPoolPrice,
    startTime,
  }).then(({ txids, mockPoolInfo }) => {
    /** continue with txids */
    console.log('txids', txids)
  })
}

howToUse();
