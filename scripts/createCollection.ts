import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Connection, Keypair, SystemProgram, clusterApiUrl } from '@solana/web3.js';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import 'dotenv/config'
import idl from '../target/idl/mint_nft.json'
import { MintNft } from '../target/types/mint_nft';
import { getMasterEdition, getMetadata, getWallet } from './utils';
import { TOKEN_METADATA_PROGRAM_ID } from './constants';

const colData = {
  name: "Thunder",
  symbol: "TD",
  uri: "https://arweave.net/_OpaQn8zmGwYQzY9Vc63_esWeMNV0Pt9f78oC9pAPM8",
  feeBasis: 0,
  totalSupply: new anchor.BN(5)
}

const main = async () => {
  let wallet = getWallet()
  let connection = new Connection(clusterApiUrl("devnet"));
  const provider = new anchor.AnchorProvider(connection, wallet, {})
  await anchor.setProvider(provider)
  
  const program = new Program<MintNft>(idl, provider)
  
  const collectionKeypair = new Keypair();
  const collectionMint = collectionKeypair.publicKey;
  const mintAuthority = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from('authority')], program.programId)[0];

  console.log("Collection program id: ", collectionMint);

  const metadata = await getMetadata(collectionMint);
    console.log('Collection Metadata Account: ', metadata.toBase58());

  const masterEdition = await getMasterEdition(collectionMint);
  console.log('Master Edition Account: ', masterEdition.toBase58());

  const destination = getAssociatedTokenAddressSync(collectionMint, wallet.publicKey);
  console.log('Destination ATA = ', destination.toBase58());

  let transactionSignature = await program.methods
  .createCollection(
    colData.name,
    colData.symbol,
    colData.uri,
    colData.feeBasis,
    colData.totalSupply,
  )
  .accountsPartial({
    user: wallet.publicKey,
    mint: collectionMint,
    mintAuthority,
    metadata,
    masterEdition,
    destination,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
  })
  .signers([collectionKeypair])
  .rpc()

  // await confirmTransaction(connection, transactionSignature);
}

main();