import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import type NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { ASSOCIATED_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Connection, Keypair, PublicKey, SystemProgram, clusterApiUrl } from '@solana/web3.js';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import type { MintNft } from '../target/types/mint_nft';
import idl from '../target/idl/mint_nft.json'

describe('mint-nft', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // let connection = new Connection(clusterApiUrl("devnet"));
  // let keypair = Keypair.fromSecretKey(bs58.decode("57wzhHrBorbTFsUqwDVEk7Sa2svjf3ohpuPtMRujvnv9rCaBweAUNrFLPbasx7UwQwCd7GfGyXanmJf649c6maVU"))
  // let wallet = new anchor.Wallet(keypair)
  // const provider = new anchor.AnchorProvider(connection, wallet, {})
  // anchor.setProvider(provider)

  const wallet = provider.wallet as NodeWallet;

  // const program = anchor.workspace.MintNft as Program<MintNft>;
  const program = new Program<MintNft>(idl, provider)

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

  const mintAuthority = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from('authority')], program.programId)[0];

  const collectionKeypair = Keypair.generate();
  // const collectionMint = collectionKeypair.publicKey;
  const collectionMint = new PublicKey("DNEUopJzFYsn3UzyCAbaHJ7sRc4PuUSACRMkAGAtTBTK")

  // const mintKeypair = Keypair.generate();
  // const mint = mintKeypair.publicKey;
  const mint = new PublicKey("2odMcLs8ARfDt3SA2NZFxmXmkkMAGcaNkWCBurA4FF8x")

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

  it.skip('Create Collection NFT', async () => {
    // const colData = {
    //   name: "Thunder",
    //   symbol: "TD",
    //   uri: "https://arweave.net/Z8fBYuJKPC0JRL4m55kbr7N1OxvHJc4u9jjN3c6j1Qs/avatar.json",
    //   feeBasis: 0
    // }
    // console.log('\nCollection Mint Key: ', collectionMint.toBase58());

    // const metadata = await getMetadata(collectionMint);
    // console.log('Collection Metadata Account: ', metadata.toBase58());

    // const masterEdition = await getMasterEdition(collectionMint);
    // console.log('Master Edition Account: ', masterEdition.toBase58());

    // const destination = getAssociatedTokenAddressSync(collectionMint, wallet.publicKey);
    // console.log('Destination ATA = ', destination.toBase58());

    // const tx = await program.methods
    //   .createCollection(
    //     colData.name,
    //     colData.symbol,
    //     colData.uri,
    //     colData.feeBasis
    //   )
    //   .accountsPartial({
    //     user: wallet.publicKey,
    //     mint: collectionMint,
    //     mintAuthority,
    //     metadata,
    //     masterEdition,
    //     destination,
    //     systemProgram: SystemProgram.programId,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    //     tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    //   })
    //   .signers([collectionKeypair])
    //   .rpc({
    //     skipPreflight: true,
    //   });
    // console.log('\nCollection NFT minted: TxID - ', tx);
  });

  it.skip('Mint NFT', async () => {
    // console.log('\nMint', mint.toBase58());

    // const metadata = await getMetadata(mint);
    // console.log('Metadata', metadata.toBase58());

    // const masterEdition = await getMasterEdition(mint);
    // console.log('Master Edition', masterEdition.toBase58());

    // const destination = getAssociatedTokenAddressSync(mint, wallet.publicKey);
    // console.log('Destination', destination.toBase58());

    // const tx = await program.methods
    //   .mintNft()
    //   .accountsPartial({
    //     owner: wallet.publicKey,
    //     destination,
    //     metadata,
    //     masterEdition,
    //     mint,
    //     mintAuthority,
    //     collectionMint,
    //     systemProgram: SystemProgram.programId,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //     associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
    //     tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    //   })
    //   .signers([mint])
    //   .rpc({
    //     skipPreflight: true,
    //   });
    // console.log('\nNFT Minted! Your transaction signature', tx);

    // await program.methods
    //   .mintNft()
    //   .accountsPartial({
    //     owner: wallet.publicKey,
    //     destination,
    //     metadata,
    //     masterEdition,
    //     mint,
    //     mintAuthority,
    //     collectionMint,
    //     systemProgram: SystemProgram.programId,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //     associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
    //     tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    //   })
    //   .signers([mintKeypair])
    //   .rpc({
    //     skipPreflight: true,
    //   });
  });

  it.skip('Verify Collection', async () => {
    // const mintMetadata = await getMetadata(mint);
    // console.log('\nMint Metadata', mintMetadata.toBase58());

    // const collectionMetadata = await getMetadata(collectionMint);
    // console.log('Collection Metadata', collectionMetadata.toBase58());

    // const collectionMasterEdition = await getMasterEdition(collectionMint);
    // console.log('Collection Master Edition', collectionMasterEdition.toBase58());

    // const tx = await program.methods
    //   .verifyCollection()
    //   .accountsPartial({
    //     authority: wallet.publicKey,
    //     metadata: mintMetadata,
    //     mint,
    //     mintAuthority,
    //     collectionMint,
    //     collectionMetadata,
    //     collectionMasterEdition,
    //     systemProgram: SystemProgram.programId,
    //     sysvarInstruction: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
    //     tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    //   })
    //   .rpc({
    //     skipPreflight: true,
    //   });
    // console.log('\nCollection Verified! Your transaction signature', tx);
  });
});
