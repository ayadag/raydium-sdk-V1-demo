import { toBufferBE } from 'bigint-buffer';
import { BN } from 'bn.js';
import Decimal from 'decimal.js';

import { web3 } from '@project-serum/anchor';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import {
  Liquidity,
  Market as RayMarket,
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
  PROGRAMIDS,
  wallet,
} from '../config';
import {
  buildAndSendTx,
  getWalletTokenAccount,
} from './util';

const ZERO = new BN(0)
type BN = typeof ZERO

type CalcStartPrice = {
  addBaseAmount: BN
  addQuoteAmount: BN
}

type LiquidityPairTargetInfo = {
  baseToken: Token
  quoteToken: Token
  targetMarketId: PublicKey
}

type WalletTokenAccounts = Awaited<ReturnType<typeof getWalletTokenAccount>>
type TestTxInputInfo = LiquidityPairTargetInfo &
  CalcStartPrice & {
    startTime: number // seconds
    walletTokenAccounts: WalletTokenAccounts
    wallet: Keypair
  }

  function calcNonDecimalValue(value: number, decimals: number): number {
    return Math.trunc(value * (Math.pow(10, decimals)))
  }

function getKeypairFromStr(str: string): web3.Keypair | null {
    try {
      return web3.Keypair.fromSecretKey(Uint8Array.from(bs58.decode(str)))
    } catch (error) {
      return null
    }
}

export function getPubkeyFromStr(str?: string) {
  try {
    return new web3.PublicKey((str ?? "").trim())
  } catch (error) {
    return null
  }
}

async function getMarketInfo(marketId: web3.PublicKey) {
  const marketAccountInfo = await connection.getAccountInfo(marketId).catch(() => null)
  if (!marketAccountInfo) throw "Market not found"

  try {
    return RayMarket.getLayouts(3).state.decode(marketAccountInfo.data)
  } catch (parseMeketDataError) {
    // log({ parseMeketDataError })
  }
  return null
}
  

async function ammCreatePool(input: TestTxInputInfo): Promise<{ txids: string[] }> {
  // -------- step 1: make instructions --------
  const initPoolInstructionResponse = await Liquidity.makeCreatePoolV4InstructionV2Simple({
    connection,
    programId: PROGRAMIDS.AmmV4,
    marketInfo: {
      marketId: input.targetMarketId,
      programId: PROGRAMIDS.OPENBOOK_MARKET,
    },
    baseMintInfo: input.baseToken,
    quoteMintInfo: input.quoteToken,
    baseAmount: input.addBaseAmount,
    quoteAmount: input.addQuoteAmount,
    startTime: new BN(Math.floor(input.startTime)),
    ownerInfo: {
      feePayer: input.wallet.publicKey,
      wallet: input.wallet.publicKey,
      tokenAccounts: input.walletTokenAccounts,
      useSOLBalance: true,
    },
    associatedOnly: false,
    checkCreateATAOwner: true,
    makeTxVersion,
    // feeDestinationId: new PublicKey('7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5'), // only mainnet use this
    feeDestinationId: new PublicKey('3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR'), // only devnet use this
  })
  console.log("initPoolInstructionResponse",initPoolInstructionResponse)
  console.log("initPoolInstructionResponse.innerTransactions",initPoolInstructionResponse.innerTransactions)
  
  // return { txids: await buildAndSendTx(initPoolInstructionResponse.innerTransactions) }
  // return { txids: await buildAndSendTx(initPoolInstructionResponse.innerTransactions, { skipPreflight: true }) }
  return { txids: await buildAndSendTx(initPoolInstructionResponse.innerTransactions, { skipPreflight: true }) }

}

async function howToUse() {
  // const baseToken = DEFAULT_TOKEN.USDC // USDC
  // const quoteToken = DEFAULT_TOKEN.RAY // RAY
  const baseToken = DEFAULT_TOKEN.SALD // USDC
  const quoteToken = DEFAULT_TOKEN.sol // RAY
  // const targetMarketId = Keypair.generate().publicKey
  // const targetMarketId = web3.Keypair.fromSecretKey(Uint8Array.from(bs58.decode("F6Abrndt3sWNreVesrb6nzqNiPfCpeY6qesTzPPbyqyd")))
  // const targetMarketId= getPubkeyFromStr("F6Abrndt3sWNreVesrb6nzqNiPfCpeY6qesTzPPbyqyd")
  // const targetMarketId= getPubkeyFromStr("BzcDHvKWD4LyW4X1NUEaWLBaNmyiCUKqcd3jXDRhwwAG")
  // const targetMarketId= getPubkeyFromStr("21TJSyureafPDtKd82dqwfns8XNJ9dfhhAWQYKtrnSf4")
  const targetMarketId= getPubkeyFromStr("7k9CxPBSmdLr1HHvsp55RKJN3uy8ayTJALciqq54qY2A")
  // const targetMarketId= getPubkeyFromStr("4cDFyfxhn1hD5WxdiJGDCMkpFCXm7g63LEAzsgt6bzWX")
  // const targetMarketId= getPubkeyFromStr("9iLzCPDnbSTaYrBqA7MWqCHSKMJByofGzvMph7Y8yeim")
  
  
  if (targetMarketId  == null) {
    return { Err: " not found" }
  } 

  const marketState = await getMarketInfo(targetMarketId).catch((getMarketInfoError) => { console.log({ getMarketInfoError }); return null })
  if (!marketState) {
    return { Err: "market not found" }
  } 
  console.log(marketState)
  
  // const addBaseAmount = new BN(2)
  // const addQuoteAmount = new BN(1)
  // const baseAmount = new BN(toBufferBE(BigInt(calcNonDecimalValue(input.baseMintAmount, baseMintState.decimals).toString()), 8))
  const bAmo = 10 //baseMintAmount
  const bDes = 9  //decimals
  const qAmo = 0.1 //quoteMintAmount
  const qDes = 9  //decimals
  const addBaseAmount = new BN(toBufferBE(BigInt(calcNonDecimalValue(bAmo, bDes).toString()), 8))
  const addQuoteAmount = new BN(toBufferBE(BigInt(calcNonDecimalValue(qAmo, qDes).toString()), 8))

  const startTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // start from 7 days later
  // const startTime = Math.floor(Date.now() / 1000) - 4;
  // const startTime = Math.floor(Date.now() / 1000);

  if(!wallet){
    return {Err: "The wallet notfound"}
  }
  
  const walletTokenAccounts = await getWalletTokenAccount(connection, wallet.publicKey)

  /* do something with start price if needed */
  console.log('pool price', new Decimal(addBaseAmount.toString()).div(new Decimal(10 ** baseToken.decimals)).div(new Decimal(addQuoteAmount.toString()).div(new Decimal(10 ** quoteToken.decimals))).toString())
  
  const poolId = Liquidity.getAssociatedId({ marketId: targetMarketId, programId: PROGRAMIDS.AmmV4 })
  console.log("poolId: ",poolId.toBase58())

  ammCreatePool({
    startTime,
    addBaseAmount,
    addQuoteAmount,
    baseToken,
    quoteToken,
    targetMarketId,
    wallet,
    walletTokenAccounts,
  }).then(({ txids }) => {
    /** continue with txids */
    // const poolId = Liquidity.getAssociatedId({ marketId: marketInfo.marketId, programId: ammProgramId })
    console.log('txids', txids)
  })

}
howToUse();
