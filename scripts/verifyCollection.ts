import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Connection, Keypair, PublicKey, SystemProgram, clusterApiUrl } from '@solana/web3.js';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import 'dotenv/config'
// import { confirmTransaction } from "@solana-developers/helpers";

import idl from '../target/idl/mint_nft.json'
import { MintNft } from '../target/types/mint_nft';
import { ASSOCIATED_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';

export const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
const nftData = {
  name: "Thunder #1",
  symbol: "TD4",
  uri: "https://arweave.net/6OsjgNMe2n8yvhW0iKSrIJrQufbCrYsi2H_wnvnAd1Y",
  feeBasis: 0
}
const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

const main = async () => {
  let connection = new Connection(clusterApiUrl("devnet"));
  let keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY))
  let wallet = new anchor.Wallet(keypair)
  const provider = new anchor.AnchorProvider(connection, wallet, {})
  await anchor.setProvider(provider)
  
  const program = new Program<MintNft>(idl, provider)
  
  // const collectionKeypair = new Keypair();
  // const collectionMint = collectionKeypair.publicKey;
  const collectionMint = new PublicKey("BLEXMofRBtndkgmi3aqYCFvjoUYmByXw9jyBPT64fdgT")
  const mintAuthority = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from('authority')], program.programId)[0];
  const mint = new PublicKey("Er6BgKNypGocrFBoEJfQmXCTN13noPWHPsfFXqNGQbBP")
  const mintMetadata = await getMetadata(mint);
  const collectionMetadata = await getMetadata(collectionMint);
  const collectionMasterEdition = await getMasterEdition(collectionMint);
  console.log('Collection Master Edition', collectionMasterEdition.toBase58());

  const tx = await program.methods
      .verifyCollection()
      .accountsPartial({
        authority: wallet.publicKey,
        metadata: mintMetadata,
        mint,
        mintAuthority,
        collectionMint,
        collectionMetadata,
        collectionMasterEdition,
        systemProgram: SystemProgram.programId,
        sysvarInstruction: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .rpc({
        skipPreflight: true,
      });
    console.log('\Collection verified! Your transaction signature', tx);
}

const getMetadata = async (mint: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey> => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  )[0];
};

const getMasterEdition = async (mint: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey> => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from('edition')],
    TOKEN_METADATA_PROGRAM_ID,
  )[0];
};

main();