use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, 
    metadata::Metadata, 
    token::{
        mint_to, 
        Mint, 
        MintTo, 
        Token, 
        TokenAccount,
    }
};
use anchor_spl::metadata::mpl_token_metadata::{
    instructions::{
        CreateMasterEditionV3Cpi, 
        CreateMasterEditionV3CpiAccounts, 
        CreateMasterEditionV3InstructionArgs, 
        CreateMetadataAccountV3Cpi, 
        CreateMetadataAccountV3CpiAccounts, 
        CreateMetadataAccountV3InstructionArgs
    }, 
    types::{
        CollectionDetails, 
        Creator, 
        DataV2
    }
};

use crate::utils::add_avatar_to_url;


#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreatorInfo {
    pub address: Pubkey,
    pub verified: bool,
    pub share: u8,
}

#[account]
pub struct LaunchpadInfo {
    pub uri: String,  // Length (4 bytes) + Assume a maximum size of 200 characters → 4 + 200 = 204 bytes
    pub name: String, // Length (4 bytes) + Assume a maximum size of 50 characters → 4 + 50 = 54 bytes
    pub symbol: String, // Length (4 bytes) + Assume a maximum size of 10 characters → 4 + 10 = 14 bytes
    pub fee_basis: u16, // 2 bytes
    pub total_supply: u64, // 8 bytes
    pub mint_count: u64, // 8 bytes
    pub collection_account: Pubkey, // 32 bytes
    pub creators: Vec<CreatorInfo>, // limit 5 creators ==> 5 * 33 = 165 bytes
    pub mint_price: u64, // 8 bytes
    pub bump: u8, // 1 bytes
}

#[derive(Accounts)]
pub struct CreateCollection<'info> {
    #[account(mut)]
    user: Signer<'info>,
    #[account(
        init,
        payer = user,
        mint::decimals = 0,
        mint::authority = mint_authority,
        mint::freeze_authority = mint_authority,
    )]
    mint: Account<'info, Mint>,

    #[account(
        seeds = [b"authority"],
        bump,
    )]
    /// CHECK: This account is not initialized and is being used for signing purposes only
    pub mint_authority: UncheckedAccount<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + 204 + 54 + 14 + 2 + 8 + 8 + 32 + 165 + 8 + 1,
        seeds = [b"collection", mint.key().as_ref()],
        bump,
    )]
    pub launchpad_info: Account<'info, LaunchpadInfo>,

    #[account(mut)]
    /// CHECK: This account will be initialized by the metaplex program
    metadata: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: This account will be initialized by the metaplex program
    master_edition: UncheckedAccount<'info>,
    #[account(
        init,
        payer = user,
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    destination: Account<'info, TokenAccount>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    associated_token_program: Program<'info, AssociatedToken>,
    token_metadata_program: Program<'info, Metadata>,
}

impl<'info> CreateCollection<'info> {
    pub fn create_collection(
        &mut self, 
        bumps: &CreateCollectionBumps,
        name: String, 
        symbol: String, 
        uri: String, 
        fee_basis: u16,
        total_supply: u64,
        mint_price: u64,
        creators: Vec<CreatorInfo>
    ) -> Result<()> {

        let metadata = &self.metadata.to_account_info();
        let master_edition = &self.master_edition.to_account_info();
        let mint = &self.mint.to_account_info();
        let authority = &self.mint_authority.to_account_info();
        let payer = &self.user.to_account_info();
        let system_program = &self.system_program.to_account_info();
        let spl_token_program = &self.token_program.to_account_info();
        let spl_metadata_program = &self.token_metadata_program.to_account_info();
        let launchpad_info = &mut self.launchpad_info;

        let seeds = &[
            &b"authority"[..], 
            &[bumps.mint_authority]
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = MintTo {
            mint: self.mint.to_account_info(),
            to: self.destination.to_account_info(),
            authority: self.mint_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        mint_to(cpi_ctx, 1)?;
        msg!("Collection NFT minted!");

        launchpad_info.uri = uri.clone();
        launchpad_info.name = name.to_string();
        launchpad_info.symbol = symbol.to_string();
        launchpad_info.fee_basis = fee_basis;
        launchpad_info.collection_account = self.mint.key();
        launchpad_info.total_supply = total_supply;
        launchpad_info.mint_count = 0;
        launchpad_info.bump = bumps.launchpad_info;
        launchpad_info.uri = uri.clone();
        launchpad_info.mint_price = mint_price;
        launchpad_info.creators = creators.clone();


        let creator_vec: Vec<Creator> = creators
            .into_iter()
            .map(|c| Creator {
                address: c.address,
                verified: c.verified,
                share: c.share,
            })
            .collect();

        let uri_avatar = add_avatar_to_url(uri.as_str());
        
        let metadata_account = CreateMetadataAccountV3Cpi::new(
            spl_metadata_program, 
            CreateMetadataAccountV3CpiAccounts {
                metadata,
                mint,
                mint_authority: authority,
                payer,
                update_authority: (authority, true),
                system_program,
                rent: None,
            },
            CreateMetadataAccountV3InstructionArgs {
                data: DataV2 {
                    name: name.to_string(),
                    symbol: symbol.to_string(),
                    uri: uri_avatar,
                    seller_fee_basis_points: fee_basis,
                    creators: Some(creator_vec),
                    collection: None,
                    uses: None,
                },
                is_mutable: true,
                collection_details: Some(
                    CollectionDetails::V1 { 
                        size: 0 
                    }
                )
            }
        );
        metadata_account.invoke_signed(signer_seeds)?;
        msg!("Metadata Account created!");

        let master_edition_account = CreateMasterEditionV3Cpi::new(
            spl_metadata_program,
            CreateMasterEditionV3CpiAccounts {
                edition: master_edition,
                update_authority: authority,
                mint_authority: authority,
                mint,
                payer,
                metadata,
                token_program: spl_token_program,
                system_program,
                rent: None,
            },
            CreateMasterEditionV3InstructionArgs {
                max_supply: Some(0),
            }
        );
        master_edition_account.invoke_signed(signer_seeds)?;
        msg!("Master Edition Account created");
        
        Ok(())
    }
}