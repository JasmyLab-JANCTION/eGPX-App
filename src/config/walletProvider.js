import { createAppKit } from "@reown/appkit/react";

import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { sepolia } from "@reown/appkit/networks";

// 1. Get projectId
const projectId = import.meta.env.VITE_BLOCKCHAIN_APP_KIT_PROJECT_ID;

// 2. Set the networks
const networks = [sepolia];

// 3. Create a metadata object - optional
const metadata = {
  name: "Janction",
  description: "Janction App",
  url: "https://janction.xyz", // origin must match your domain & subdomain
  icons: ["https://janction.xyz/favicon.ico"],
};

// 4. Create a AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});
