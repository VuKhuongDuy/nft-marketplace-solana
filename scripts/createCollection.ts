import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, clusterApiUrl } from '@solana/web3.js';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import 'dotenv/config'
import { mplTokenMetadata, verifyCreatorV1 } from '@metaplex-foundation/mpl-token-metadata'

import idl from '../target/idl/mint_nft.json'
import { MintNft } from '../target/types/mint_nft';
import { getMasterEdition, getMetadata, getMetadataPda, getWallet } from './utils';
import { TOKEN_METADATA_PROGRAM_ID, USER2_PK, USER_PK } from './constants';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, generateSigner, signerIdentity, Keypair as UniKeypair } from '@metaplex-foundation/umi';

const colData = {
  name: "Thunder",
  symbol: "TD",
  uri: "https://arweave.net/_OpaQn8zmGwYQzY9Vc63_esWeMNV0Pt9f78oC9pAPM8",
  feeBasis: 0,
  totalSupply: new anchor.BN(5),
  mintPrice: new anchor.BN(LAMPORTS_PER_SOL) // 1 SOL
}

const main = async () => {
  let wallet = getWallet()
  let connection = new Connection(clusterApiUrl("devnet"));
  const provider = new anchor.AnchorProvider(connection, wallet, {})
  await anchor.setProvider(provider)
  let keypair1 = Keypair.fromSecretKey(bs58.decode(USER_PK))
  let user1 = new anchor.Wallet(keypair1);
  let keypair2 = Keypair.fromSecretKey(bs58.decode(USER2_PK))
  let user2 = new anchor.Wallet(keypair2);
  const umi = createUmi('https://api.devnet.solana.com').use(mplTokenMetadata())

  
  const program = new Program<MintNft>(idl, provider)
  
  const collectionKeypair = new Keypair();
  const collectionMint = collectionKeypair.publicKey;
  const mintAuthority = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from('authority')], program.programId)[0];

  console.log("Collection program id: ", collectionMint);

  const metadata = await getMetadataPda(collectionMint);
    console.log('Collection Metadata Account: ', metadata[0].toBase58());

  const masterEdition = await getMasterEdition(collectionMint);
  console.log('Master Edition Account: ', masterEdition.toBase58());

  const destination = getAssociatedTokenAddressSync(collectionMint, wallet.publicKey);
  console.log('Destination ATA = ', destination.toBase58());
  const creators = [
    {
      address: user1.publicKey,
      verified: false,
      share: 30,
    },
    {
      address: user2.publicKey,
      verified: false,
      share: 70,
    },
  ];

  let transactionSignature = await program.methods
  .createCollection(
    colData.name,
    colData.symbol,
    colData.uri,
    colData.feeBasis,
    colData.totalSupply,
    colData.mintPrice,
    creators
  )
  .accountsPartial({
    user: wallet.publicKey,
    mint: collectionMint,
    mintAuthority,
    metadata: metadata[0],
    masterEdition,
    destination,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
  })
  .signers([
    collectionKeypair,
  ])
  .rpc()

  const signer = createSignerFromKeypair(umi, keypair1)
  umi.use(signerIdentity(signer))
  await verifyCreatorV1(umi, {
    metadata: metadata,
    authority: metadata[0],
  }).sendAndConfirm(umi)
}

main();