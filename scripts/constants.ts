import * as anchor from '@coral-xyz/anchor';
import 'dotenv/config'

export const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
export const USER_PK = process.env.USER_PK || ''
export const USER2_PK = process.env.USER2_PK || ''

export const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
