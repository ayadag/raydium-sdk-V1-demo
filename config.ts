import { web3 } from '@project-serum/anchor';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import {
  Currency,
  DEVNET_PROGRAM_ID,
  ENDPOINT as _ENDPOINT,
  RAYDIUM_MAINNET,
  Token,
  TOKEN_PROGRAM_ID,
  TxVersion,
} from '@raydium-io/raydium-sdk';
import {
  Connection,
  PublicKey,
} from '@solana/web3.js';

function getKeypairFromStr(str: string): web3.Keypair | null {
  try {
    return web3.Keypair.fromSecretKey(Uint8Array.from(bs58.decode(str)))
  } catch (error) {
    return null
  }
}


// export const rpcUrl: string = 'https://xxx.xxx.xxx/'
export const rpcUrl: string = 'https://api.devnet.solana.com'
export const rpcToken: string | undefined = undefined

// export const wallet = Keypair.fromSecretKey(Buffer.from('<YOUR_WALLET_SECRET_KEY>'))
// export const wallet = Keypair.fromSecretKey(Buffer.from('43EeRipwq7QZurfASn7CnYuJ14pVaCEv7KWav9vknt1bFR6qspYXC2DbaC2gGydrVx4TFtWfyCFkEaLLLMB2bZoT'))
// export const wallet = getKeypairFromStr("43EeRipwq7QZurfASn7CnYuJ14pVaCEv7KWav9vknt1bFR6qspYXC2DbaC2gGydrVx4TFtWfyCFkEaLLLMB2bZoT")
export const wallet = web3.Keypair.fromSecretKey(Uint8Array.from(bs58.decode("43EeRipwq7QZurfASn7CnYuJ14pVaCEv7KWav9vknt1bFR6qspYXC2DbaC2gGydrVx4TFtWfyCFkEaLLLMB2bZoT")))

// export const connection = new Connection('<YOUR_RPC_URL>');
export const connection = new Connection('https://api.devnet.solana.com');

// export const PROGRAMIDS = MAINNET_PROGRAM_ID;
export const PROGRAMIDS = DEVNET_PROGRAM_ID;

export const ENDPOINT = _ENDPOINT;

export const RAYDIUM_MAINNET_API = RAYDIUM_MAINNET;

export const makeTxVersion = TxVersion.V0; // LEGACY
// export const makeTxVersion = TxVersion.LEGACY; // LEGACY

////////////////ayad///////
// export const addLookupTableInfo = LOOKUP_TABLE_CACHE // only mainnet. other = undefined
export const addLookupTableInfo = undefined // only mainnet. other = undefined

export const DEFAULT_TOKEN = {
  'SOL': new Currency(9, 'USDC', 'USDC'),
  'WSOL': new Token(TOKEN_PROGRAM_ID, new PublicKey('So11111111111111111111111111111111111111112'), 9, 'WSOL', 'WSOL'),
  'USDC': new Token(TOKEN_PROGRAM_ID, new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), 6, 'USDC', 'USDC'),
  'RAY': new Token(TOKEN_PROGRAM_ID, new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'), 6, 'RAY', 'RAY'),
  'RAY_USDC-LP': new Token(TOKEN_PROGRAM_ID, new PublicKey('FGYXP4vBkMEtKhxrmEBcWN8VNmXX8qNgEJpENKDETZ4Y'), 6, 'RAY-USDC', 'RAY-USDC'),

  'SALD': new Token(TOKEN_PROGRAM_ID, new PublicKey('Duqm5K5U1H8KfsSqwyWwWNWY5TLB9WseqNEAQMhS78hb'), 9, 'SALD', 'SALD'),
  'sol': new Token(TOKEN_PROGRAM_ID, new PublicKey('So11111111111111111111111111111111111111112'), 9),


}