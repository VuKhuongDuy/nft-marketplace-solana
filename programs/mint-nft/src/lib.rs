use anchor_lang::prelude::*;

declare_id!("AZCs4LwovZxVmLbbGmxW8k6d32xSYRGeV8HpRVY5Y3To");

pub mod contexts;
pub mod utils;

pub use contexts::*;

#[program]
pub mod mint_nft {


    use super::*;
    pub fn create_collection(
        ctx: Context<CreateCollection>,
        name: String, 
        symbol: String, 
        uri: String, 
        fee_basis: u16,
        total_supply: u64,
        mint_price: u64,
        creators: Vec<CreatorInfo>
    ) -> Result<()> {
        ctx.accounts.create_collection(&ctx.bumps, name, symbol, uri, fee_basis, total_supply, mint_price, creators)
    }
    
    pub fn mint_nft(
        ctx: Context<MintNFT>,
    ) -> Result<()> {
        ctx.accounts.mint_nft(&ctx.bumps)
    }

    pub fn verify_collection(ctx: Context<VerifyCollectionMint>) -> Result<()> {
        ctx.accounts.verify_collection(&ctx.bumps)
    }
}
