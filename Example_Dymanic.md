World
Build a Complete World Mini App with Dynamic

Copy page

Integrate Dynamic’s wallet management and authentication in World Mini Apps with cross-wallet transfers.

Dynamic provides two powerful ways to enhance your World Mini App:
External Wallet Connection & Embedded Wallets
Connect users’ existing external wallets (like MetaMask, Rainbow, etc.)
Create new embedded wallets for users who don’t have one, using their email, phone number, OAuth, etc.
Manage multiple wallet connections seamlessly
Sign-In with Ethereum (SIWE) for World ID Wallets
Implement secure authentication using World ID wallets
Enable users to interact with their World ID wallet
In this guide, we’ll implement both approaches and demonstrate how to create an integration that allows users to:
Connect their external wallets or create new embedded wallets
Sign in with their World ID wallet
Transfer funds between their Dynamic wallet and World ID wallet
Support multiple tokens (ETH, WLD, USDC)
You can find the complete source code for this guide in our GitHub repository.

​
Setup
​
Dynamic Environment Setup
Navigate to the Dynamic Dashboard
Copy your Environment ID from the SDK and API Keys section - you’ll need this to initialize Dynamic in your World Mini App
​
Dynamic Next.js Starter
If you don’t have a project yet, create one:

Copy

Ask AI
npx create-dynamic-app@latest my-world-app
cd my-world-app
​
Getting Started
​
1. Install Required Dependencies
First, install the necessary packages:

npm

yarn

bun

pnpm

Copy

Ask AI
npm install @dynamic-labs/sdk-api-core @dynamic-labs/utils @worldcoin/minikit-js @worldcoin/minikit-react eruda
​
2. Set Up Project Structure
Create the following project structure:

Copy

Ask AI
world-miniapp/
├── .env.local                   # Environment variables
├── app/
│   ├── page.tsx                 # Main app page
│   ├── layout.tsx               # App layout
│   ├── globals.css              # Global styles
│   └── components/
│       ├── WorldDynamicSIWE.tsx # SIWE authentication component
│       ├── WalletTransfers.tsx  # Cross-wallet transfer component
├── lib/
│   ├── providers.tsx            # Dynamic and other providers
│   ├── utils.ts                 # General utility functions
│   └── wagmi.ts                 # Wagmi configuration
​
3. Configure Environment Variables
Create a .env.local file with your credentials:

Copy

Ask AI
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id-here
​
Implementation
​
1. SIWE Authentication Setup
First, let’s set up the authentication providers that will connect Dynamic’s SIWE functionality with Worldcoin’s wallet:
lib/providers.tsx

Copy

Ask AI
"use client";

import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { DYNAMIC_ENVIRONMENT_ID } from "./utils";
import { config } from "./wagmi";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  // Initialize eruda for debugging in the World App environment
  useEffect(() => {
    import("eruda").then((eruda) => {
      eruda.default.init();
    });
  }, []);

  return (
    <DynamicContextProvider
      theme="auto"
      settings={{
        environmentId: DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <MiniKitProvider>{children}</MiniKitProvider>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
The providers setup includes:
Dynamic’s context provider for wallet management
Wagmi provider for Ethereum interactions
MiniKit provider for World ID wallet integration
Eruda for debugging in the World App environment
​
2. Create Utility Functions
Create the Dynamic API helper and other utility functions:
lib/utils.ts

Copy

Ask AI
"use client";

import { Configuration, SDKApi } from "@dynamic-labs/sdk-api-core";
import {
  getAuthToken,
  VERSION as SDKVersion,
} from "@dynamic-labs/sdk-react-core";
import { FetchService } from "@dynamic-labs/utils";

// Constants
export const DYNAMIC_ENVIRONMENT_ID =
  process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!;

// Dynamic API helper for authentication and verification
export const dynamicApi = () => {
  const settings = {
    basePath: "https://app.dynamicauth.com/api/v0",
    headers: {
      "Content-Type": "application/json",
      "x-dyn-version": `WalletKit/${SDKVersion}`,
      "x-dyn-api-version": "API/0.0.507",
      Authorization: "",
    },
  };

  const minJwt = getAuthToken();
  if (minJwt) {
    settings.headers.Authorization = `Bearer ${minJwt}`;
  }

  return new SDKApi(
    new Configuration({
      ...settings,
      fetchApi: FetchService.fetch,
    })
  );
};
​
3. Create SIWE Authentication Component
Create a new file components/WorldDynamicSIWE.tsx that integrates Worldcoin’s MiniKit with Dynamic’s SIWE flow:
app/components/WorldDynamicSIWE.tsx

Copy

Ask AI
"use client";

import { generateMessageToSign } from "@dynamic-labs/multi-wallet";
import { VerifyRequestFromJSON } from "@dynamic-labs/sdk-api-core";
import { useRefreshUser, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { MiniKit } from "@worldcoin/minikit-js";
import { FC, useState } from "react";
import { DYNAMIC_ENVIRONMENT_ID, dynamicApi } from "@/lib/utils";

const WorldDynamicSIWE: FC = () => {
  const refreshUser = useRefreshUser();
  const { user, primaryWallet } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siweData, setSiweData] = useState<any>(null);

  // Safe JSON stringification to handle circular references
  const safeStringify = (obj: unknown): string => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (_, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
      }
      return value;
    }, 2);
  };

  // Nonce management functions
  const storeNonce = (nonce: string) => {
    localStorage.setItem("dynamic_nonce", JSON.stringify({ value: nonce }));
  };

  const consumeNonce = () => {
    const nonceString = localStorage.getItem("dynamic_nonce");
    if (nonceString) {
      const nonceObject = JSON.parse(nonceString);
      localStorage.removeItem("dynamic_nonce");
      return nonceObject.value;
    }
    return null;
  };

  const generateDynamicNonce = async (): Promise<string> => {
    const response = await fetch(
      `https://app.dynamicauth.com/api/v0/sdk/${DYNAMIC_ENVIRONMENT_ID}/nonce`,
      { method: "GET" }
    );
    const data = await response.json();
    return data.nonce;
  };

  // Verify user with Dynamic API
  const callVerifyUser = async (
    messageToSign: string,
    address: string,
    signedMessage: string
  ) => {
    const verifyRequest = VerifyRequestFromJSON({
      chain: "EVM",
      messageToSign,
      network: "1",
      publicWalletAddress: address,
      signedMessage,
      walletName: "worldcoin",
      walletProvider: "browserExtension",
    });

    const response = await dynamicApi().verify({
      environmentId: DYNAMIC_ENVIRONMENT_ID,
      verifyRequest,
    });

    // Store authentication tokens
    window.localStorage.setItem(
      "dynamic_authentication_token",
      JSON.stringify(response.jwt)
    );
    window.localStorage.setItem(
      "dynamic_min_authentication_token",
      JSON.stringify(response.jwt)
    );

    return response;
  };

  // Main authentication handler
  const handleWorldcoinSIWE = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!primaryWallet) {
        throw new Error("No wallet connected");
      }

      // Generate and store nonce
      const dynamicNonce = await generateDynamicNonce();
      storeNonce(dynamicNonce);

      // Initiate Worldcoin authentication
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: dynamicNonce,
      });

      // Generate message to sign
      const messageToSign = generateMessageToSign({
        blockchain: "EVM",
        chainId: 1,
        domain: window.location.host,
        nonce: consumeNonce(),
        publicKey: primaryWallet.address,
        requestId: DYNAMIC_ENVIRONMENT_ID,
        uri: window.location.href,
      });

      // Sign message and verify
      const signature = await primaryWallet.signMessage(messageToSign);
      const verifyResponse = await callVerifyUser(
        messageToSign,
        primaryWallet.address,
        signature
      );

      // Update user and store data
      await refreshUser();
      setSiweData({
        message: messageToSign,
        signature,
        address: primaryWallet.address,
        verifyResponse,
        worldcoinPayload: JSON.parse(safeStringify(finalPayload)),
        walletSource: primaryWallet.connector?.name || "Unknown",
        connectedDynamic: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "SIWE authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="world-dynamic-siwe">
      <h3>World ID SIWE Authentication</h3>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {!siweData ? (
        <button
          onClick={handleWorldcoinSIWE}
          disabled={isLoading || !primaryWallet}
          className="siwe-button"
        >
          {isLoading ? "Authenticating..." : "Sign-In with Worldcoin"}
        </button>
      ) : (
        <div className="siwe-data">
          <h4>Authentication Success!</h4>
          <div className="data-display">
            <p><strong>Wallet Source:</strong> {siweData.walletSource}</p>
            <p><strong>Connected to Dynamic:</strong> {siweData.connectedDynamic ? "Yes" : "No"}</p>
            <p><strong>Address:</strong> <code>{siweData.address}</code></p>
            <details>
              <summary>View Complete SIWE Data</summary>
              <pre>{JSON.stringify(siweData, null, 2)}</pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldDynamicSIWE;
In this file, we’re first generating a nonce for the user, then, we ask the user to sign in using their world ID wallet. Finally, we call the Dynamic API to verify the user’s signature and sign the user in.
You can find the styles that I’ve used here.
​
4. Create Main App Page
Create the main page of your World Mini App:
app/page.tsx

Copy

Ask AI
"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import Image from "next/image";
import { useEffect, useState } from "react";
import WorldDynamicSIWE from "./components/WorldDynamicSIWE";
import WalletTransfers from "./components/WalletTransfers";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

export default function Main() {
  const [isMiniKitInstalled, setIsMiniKitInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMiniKitInstallation = async () => {
      try {
        const result = await MiniKit.install();
        setIsMiniKitInstalled(result.success);
      } catch (error) {
        console.error("Failed to install MiniKit:", error);
        setIsMiniKitInstalled(false);
      }
    };

    checkMiniKitInstallation();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <Image
          className="logo"
          src="/logo-dark.png"
          alt="dynamic"
          width={200}
          height={20}
          priority
        />
      </div>

      {isMiniKitInstalled === false && (
        <div className="warning-banner">
          This is a World Mini App. Please open it within the World App for full functionality.
        </div>
      )}

      <div className="app-title">
        <h1>World ID + Dynamic Integration</h1>
      </div>

      <div className="modal">
        <div className="wallet-connect-section">
          <DynamicWidget />
          <WorldDynamicSIWE />
        </div>

        <div className="wallet-funding-section">
          <h3>Wallet Transfers</h3>
          <WalletTransfers />
        </div>
      </div>

      <div className="footer">
        <div>Made with 💙 by Dynamic</div>
      </div>
    </div>
  );
}
Here, we’re checking if the user has the World ID Mini App installed, and if not, we’re showing a warning banner. We’re also showing the Dynamic Widget and the World Dynamic SIWE component.
​
5. Add Wallet Transfer Capabilities
Create the cross-wallet transfer component:
app/components/WalletTransfers.tsx

Copy

Ask AI
"use client";

import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { MiniKit, Tokens, tokenToDecimals } from "@worldcoin/minikit-js";
import { FC, useEffect, useState } from "react";
import { parseEther } from "viem";
import { ForwardABI } from "@/consts/ForwardABI";

export enum TokenSymbol {
  ETH = "ETH",
  WLD = "WLD",
  USDC = "USDC",
}

// Token contract addresses
const WLD_TOKEN_ADDRESS = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";
const USDC_TOKEN_ADDRESS = "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1";


export interface FundingFormState {
  amount: string;
  tokenSymbol: TokenSymbol;
  recipientAddress: string;
  direction: "dynamic-to-world" | "world-to-dynamic";
}

const WalletTransfers: FC = () => {
  const { user, primaryWallet } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [worldIdWalletAddress, setWorldIdWalletAddress] = useState<string | null>(null);

  const [fundingForm, setFundingForm] = useState<FundingFormState>({
    amount: "0.001",
    tokenSymbol: TokenSymbol.ETH,
    recipientAddress: "",
    direction: "world-to-dynamic",
  });

  // Get World ID wallet address
  const getWorldIdWallet = async () => {
    try {
      if (!(await MiniKit.isInstalled())) {
        return null;
      }

      const { finalPayload } = await MiniKit.commandsAsync.signMessage({
        message: "Get wallet address",
      });

      if (finalPayload.status === "error") {
        setError("Failed to get World ID wallet address");
        return null;
      }

      setWorldIdWalletAddress(finalPayload.address);
      return finalPayload.address;
    } catch (error) {
      setError("Failed to get World ID wallet address");
      return null;
    }
  };

  useEffect(() => {
    getWorldIdWallet();

    if (user?.verifiedCredentials?.[0]?.address) {
      setFundingForm((prev) => ({
        ...prev,
        recipientAddress: user.verifiedCredentials[0].address || "",
      }));
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFundingForm((prev) => {
      if (name === "direction") {
        const direction = value as "world-to-dynamic" | "dynamic-to-world";
        const recipientAddress =
          direction === "world-to-dynamic"
            ? user?.verifiedCredentials?.[0]?.address || ""
            : worldIdWalletAddress || "";
        return { ...prev, direction, recipientAddress };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleTransfer = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { amount, tokenSymbol, direction } = fundingForm;

      if (!amount || parseFloat(amount) <= 0) {
        setError("Please provide a valid amount greater than 0");
        return;
      }

      const finalRecipientAddress =
        direction === "world-to-dynamic"
          ? user?.verifiedCredentials?.[0]?.address
          : worldIdWalletAddress;

      if (!finalRecipientAddress) {
        setError(
          direction === "world-to-dynamic"
            ? "Dynamic wallet not connected"
            : "World ID wallet not connected"
        );
        return;
      }

      if (direction === "world-to-dynamic" && !(await MiniKit.isInstalled())) {
        setError("MiniKit not installed");
        return;
      }

      const paymentReference = `payment-${Date.now()}`;

      if (tokenSymbol === TokenSymbol.ETH) {
        await handleETHTransfer(amount, finalRecipientAddress, direction);
      } else {
        await handleTokenTransfer(tokenSymbol, amount, finalRecipientAddress, direction, paymentReference);
      }
    } catch (error: any) {
      setError(error instanceof Error ? error.message : "Failed to transfer funds");
    } finally {
      setIsLoading(false);
    }
  };

  const handleETHTransfer = async (amount: string, recipient: string, direction: string) => {
    if (direction === "dynamic-to-world") {
      if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
        throw new Error("Dynamic wallet not connected or not Ethereum compatible");
      }

      const walletClient = await primaryWallet.getWalletClient();
      const publicClient = await primaryWallet.getPublicClient();

      const hash = await walletClient.sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setResult(
        `Successfully sent ${amount} ETH to ${recipient.substring(0, 8)}...${recipient.substring(
          recipient.length - 6
        )}. TX: ${receipt.transactionHash.substring(0, 12)}...`
      );
    } else {
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: "0x087d5449a126e4e439495fcBc62A853eB3257936",
            abi: ForwardABI,
            functionName: "pay",
            args: [recipient],
            value: `0x${parseEther(amount).toString(16)}`,
          },
        ],
      });

      if (finalPayload.status === "error") {
        throw new Error("Transaction failed");
      }

      setResult(
        `Successfully sent ${amount} ETH to ${recipient.substring(0, 8)}...${recipient.substring(
          recipient.length - 6
        )}. TX: ${finalPayload.transaction_id.substring(0, 12)}...`
      );
    }
  };

  const handleTokenTransfer = async (
    tokenSymbol: TokenSymbol,
    amount: string,
    recipient: string,
    direction: string,
    paymentReference: string
  ) => {
    if (direction === "dynamic-to-world") {
      if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
        throw new Error("Dynamic wallet not connected or not Ethereum compatible");
      }

      const walletClient = await primaryWallet.getWalletClient();
      const publicClient = await primaryWallet.getPublicClient();

      const tokenAddress = tokenSymbol === TokenSymbol.WLD ? WLD_TOKEN_ADDRESS : USDC_TOKEN_ADDRESS;
      const decimals = tokenSymbol === TokenSymbol.WLD ? 18 : 6;
      const amountInWei = BigInt(parseFloat(amount) * Math.pow(10, decimals));

      const transferABI = [
        {
          name: "transfer",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ name: "", type: "bool" }],
        },
      ];

      const hash = await walletClient.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: transferABI,
        functionName: "transfer",
        args: [recipient, amountInWei],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setResult(
        `Successfully sent ${amount} ${tokenSymbol} to ${recipient.substring(0, 8)}...${recipient.substring(
          recipient.length - 6
        )}. TX: ${receipt.transactionHash.substring(0, 12)}...`
      );
    } else {
      const { finalPayload } = await MiniKit.commandsAsync.pay({
        reference: paymentReference,
        to: recipient,
        tokens: [
          {
            symbol: tokenSymbol === TokenSymbol.WLD ? Tokens.WLD : Tokens.USDCE,
            token_amount: tokenToDecimals(
              parseFloat(amount),
              tokenSymbol === TokenSymbol.WLD ? Tokens.WLD : Tokens.USDCE
            ).toString(),
          },
        ],
        description: `Transfer ${amount} ${tokenSymbol} to ${recipient.substring(0, 8)}...`,
      });

      if (finalPayload.status === "error") {
        throw new Error("Transaction failed");
      }

      setResult(
        `Successfully sent ${amount} ${tokenSymbol} to ${recipient.substring(0, 8)}...${recipient.substring(
          recipient.length - 6
        )}. TX: ${finalPayload.transaction_id.substring(0, 12)}...`
      );
    }
  };
  return (
    <div className="world-funding">
      <div className="wallets-container">
        {worldIdWalletAddress ? (
          <div className="wallet-info">
            <div className="wallet-header">
              <span className="wallet-icon">🌎</span>
              <div className="wallet-details">
                <span className="wallet-label">World ID Wallet</span>
                <code className="wallet-address">
                  {worldIdWalletAddress.substring(0, 8)}...
                  {worldIdWalletAddress.substring(worldIdWalletAddress.length - 6)}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(worldIdWalletAddress);
                    setResult("World ID wallet address copied to clipboard!");
                  }}
                  className="copy-button"
                  title="Copy Address"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="wallet-connect-prompt">
            <p>World ID wallet not detected. Open in World App to connect.</p>
          </div>
        )}

        {user?.verifiedCredentials?.[0]?.address && (
          <div className="wallet-info connected-dynamic">
            <div className="wallet-header">
              <span className="wallet-icon">💼</span>
              <div className="wallet-details">
                <span className="wallet-label">Connected Wallet</span>
                <code className="wallet-address">
                  {user.verifiedCredentials[0].address.substring(0, 8)}...
                  {user.verifiedCredentials[0].address.substring(
                    user.verifiedCredentials[0].address.length - 6
                  )}
                </code>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {result && (
        <div className="success-message">
          <p>{result}</p>
        </div>
      )}

      <div className="funding-form">
        <h4>Transfer Funds</h4>

        <div className="form-group">
          <label htmlFor="direction">Transfer Direction:</label>
          <select
            id="direction"
            name="direction"
            value={fundingForm.direction}
            onChange={handleInputChange}
            className="direction-select"
          >
            <option value="world-to-dynamic">World ID → Dynamic Wallet</option>
            <option value="dynamic-to-world">Dynamic → World ID Wallet</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount:</label>
          <div className="input-with-select">
            <input
              type="number"
              id="amount"
              name="amount"
              step="0.0001"
              value={fundingForm.amount}
              onChange={handleInputChange}
              min="0.0001"
            />
            <select
              id="tokenSymbol"
              name="tokenSymbol"
              value={fundingForm.tokenSymbol}
              onChange={handleInputChange}
            >
              <option value={TokenSymbol.ETH}>ETH</option>
              <option value={TokenSymbol.WLD}>WLD</option>
              <option value={TokenSymbol.USDC}>USDC</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="recipientAddress">Recipient Address:</label>
          <input
            type="text"
            id="recipientAddress"
            name="recipientAddress"
            placeholder="0x..."
            value={fundingForm.recipientAddress}
            onChange={handleInputChange}
          />
        </div>

        <button
          onClick={handleTransfer}
          disabled={isLoading || !fundingForm.recipientAddress || !worldIdWalletAddress}
          className="transfer-button"
        >
          {isLoading ? "Processing..." : "Transfer Funds"}
        </button>
      </div>
    </div>
  );
};

export default WalletTransfers;
You also need to create a consts folder and add the ForwardABI to it. You can find the ABI here.
Here, a couple of things are happening:
Firstly we have a pretty straight forward logic for handling the UI of which token to transfer from where to where.
To pay from a user’s dynamic wallet we’re using the sendTransaction method from the viem public client.
To pay USDC, and WLD from a user’s world ID wallet we’re using the pay method from the MiniKit. Check out the MiniKit documentation for more details.
We’re also using the ForwardABI to pay ETH from a user’s world ID wallet. Check out the Send Transaction MiniKit documentation for more details.
You can find the styles that I’ve used here.
​
Running Your World Mini App
To run your World Mini App with Worldcoin SIWE integration:

Copy

Ask AI
npm run dev
In the development environment, you can use Ngrok or cloudflared to expose your local server to the internet, allowing you to test the World Mini App in the World App.
Head over to the Worldcoin Developer dashboard, create a new app and add your tunnel URL as the app URL. This will allow you to test your Dynamic-powered World Mini App in the World App. Make sure to add the Forward contract address to the app under configuration > Advanced > Contract Entrypoints. You can find the contract address here.
Finally, you can open it in the World App by scanning the QR code or entering the URL directly.
Make sure to add your domain to next.config.js in allowedDevOrigins:
next.config.js

Copy

Ask AI
/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "https://*.ngrok-free.app",
  ],
};

module.exports = nextConfig;