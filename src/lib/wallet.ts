import { createContext } from "react";
import { CHAIN_IDS, RPC_URLS } from "./constants";

export interface WalletContextType {
  isConnected: boolean;
  address: string;
  chainId: number;
  balance: string;
  connectWallet: () => Promise<boolean | undefined>;
  disconnectWallet: () => void;
  // switchChain: (chainId: number) => Promise<boolean>;
}

export const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: "",
  chainId: 0,
  balance: "0",
  connectWallet: async () => false,
  disconnectWallet: () => {},
  // switchChain: async () => false,
});

/**
 * Formats an Ethereum address for display
 * @param address - The full Ethereum address
 * @param startChars - Number of characters to show at the start
 * @param endChars - Number of characters to show at the end
 */
export const formatAddress = (
  address: string,
  startChars = 6,
  endChars = 4
): string => {
  if (!address || address.length < startChars + endChars + 3) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Handles switching to a specific blockchain network
 * @param chainId - The chain ID to switch to
 */
export const switchNetwork = async (chainId: number): Promise<boolean> => {
  if (!window.ethereum) return false;

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    return true;
  } catch (error: any) {
    // If the error code is 4902, the chain isn't added to MetaMask
    if (error.code === 4902) {
      try {
        // Add the network
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: chainId === CHAIN_IDS.PULSECHAIN ? "PulseChain" : "Ethereum",
              nativeCurrency: {
                name: chainId === CHAIN_IDS.PULSECHAIN ? "PLS" : "ETH",
                symbol: chainId === CHAIN_IDS.PULSECHAIN ? "PLS" : "ETH",
                decimals: 18,
              },
              rpcUrls: [RPC_URLS[chainId]],
              blockExplorerUrls: [
                chainId === CHAIN_IDS.PULSECHAIN
                  ? "https://scan.pulsechain.com"
                  : "https://etherscan.io",
              ],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error("Error adding the network to MetaMask:", addError);
        return false;
      }
    }
    console.error("Error switching networks:", error);
    return false;
  }
};

/**
 * Converts a hex string to a decimal number
 * @param hex - Hex string to convert
 */
export const hexToDecimal = (hex: string): number => {
  return parseInt(hex, 16);
};
