import * as anchor from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Connection, Keypair, PublicKey, SystemProgram, clusterApiUrl } from '@solana/web3.js';
import { ASSOCIATED_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';

// import { confirmTransaction } from "@solana-developers/helpers";

import idl from '../target/idl/mint_nft.json'
import { MintNft } from '../target/types/mint_nft';
import { getMasterEdition, getMetadata, getWallet } from './utils';
import { TOKEN_METADATA_PROGRAM_ID } from './constants';

const nftData = {
  name: "Thunder #1",
  symbol: "TD4",
  uri: "https://arweave.net/6OsjgNMe2n8yvhW0iKSrIJrQufbCrYsi2H_wnvnAd1Y",
  feeBasis: 0
}

const main = async () => {
  let wallet = getWallet()
  let connection = new Connection(clusterApiUrl("devnet"));
  const provider = new anchor.AnchorProvider(connection, wallet, {})
  await anchor.setProvider(provider)
  
  const program = new anchor.Program<MintNft>(idl, provider)
  
  const collectionMint = new PublicKey("5dys7TP7ZKEBYny5DBkGyQ6wMYqJ1Ck33b6U6aXdTEVq")
  const mintAuthority = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from('authority')], program.programId)[0];
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;

  console.log("Mint program id: ", mint);

  const metadata = await getMetadata(mint);
    console.log('Collection Metadata Account: ', metadata.toBase58());

  const masterEdition = await getMasterEdition(mint);
  console.log('Master Edition Account: ', masterEdition.toBase58());

  const destination = getAssociatedTokenAddressSync(mint, wallet.publicKey);
  console.log('Destination ATA = ', destination.toBase58());

  const tx = await program.methods
      .mintNft(
        nftData.name,
        nftData.symbol,
        nftData.uri,
        nftData.feeBasis
      )
      .accountsPartial({
        owner: wallet.publicKey,
        destination,
        metadata,
        masterEdition,
        mint,
        mintAuthority,
        collectionMint,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([mintKeypair])
      .rpc({
        skipPreflight: true,
      });
    console.log('\nNFT Minted! Your transaction signature', tx);
}

main();