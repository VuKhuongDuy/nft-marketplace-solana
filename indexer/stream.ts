import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';

// Connect to the Solana devnet/mainnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Replace with your program ID
const programId = new PublicKey('AZCs4LwovZxVmLbbGmxW8k6d32xSYRGeV8HpRVY5Y3To');

// Set up a listener for logs emitted by your program
const subscriptionId = connection.onLogs(
  programId,          // The program's public key
  (logs, context) => {
    // logs contains the logs emitted by the program during transaction execution
    console.log("Logs: ", logs);

    // Check if the log contains the specific minting message
    if (logs.logs.some(log => log.includes("Collection NFT minted!"))) {
      console.log("NFT Mint Detected! Log Context:", context);
      // Handle the log or extract more information from the context
      // Example: you can fetch the transaction details from the context if needed
    }
  },
  'confirmed'         // Get logs from confirmed transactions
);

// Optionally, to stop listening at some point
// connection.removeOnLogsListener(subscriptionId);
