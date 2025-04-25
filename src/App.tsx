import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import NotFound from "./pages/not-found";
import Bridge from "./pages/bridge";
import Pools from "./pages/pools";
import Rewards from "./pages/rewards";
import AppHeader from "./components/app-header";
import AppFooter from "./components/app-footer";
import { useState, useEffect } from "react";
import { WalletContext, WalletContextType } from "./lib/wallet";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Bridge} />
      <Route path="/bridge" component={Bridge} />
      <Route path="/pools" component={Pools} />
      {/* <Route path="/stake" component={Stake} /> */}
      {/* <Route path="/rewards" component={Rewards} /> */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [wallet, setWallet] = useState<WalletContextType>({
    isConnected: false,
    address: "",
    chainId: 0,
    balance: "0",
    connectWallet: async () => {
      try {
        // Check if window.ethereum is available
        if (typeof window !== "undefined" && window.ethereum) {
          // Request account access
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          
          if (accounts.length > 0) {
            // Get ETH balance
            const balance = await window.ethereum.request({
              method: "eth_getBalance",
              params: [accounts[0], "latest"],
            });
            
            setWallet({
              ...wallet,
              isConnected: true,
              address: accounts[0],
              chainId: parseInt(chainId, 16),
              balance: parseInt(balance, 16).toString(),
            });
            
            return true;
          }
        } else {
          throw new Error("No Ethereum wallet detected");
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
        return false;
      }
    },
    disconnectWallet: () => {
      setWallet({
        ...wallet,
        isConnected: false,
        address: "",
        chainId: 0,
        balance: "0",
      });
    }
  });

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          // User has disconnected wallet
          wallet.disconnectWallet();
        } else {
          // Account changed, update state
          setWallet({
            ...wallet,
            address: accounts[0],
          });
        }
      });

      window.ethereum.on("chainChanged", (chainId: string) => {
        // Chain changed, update state
        setWallet({
          ...wallet,
          chainId: parseInt(chainId, 16),
        });
      });
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WalletContext.Provider value={wallet}>
        <div className="min-h-screen flex flex-col bg-neutral-900">
          <AppHeader />
          <div className="flex-grow">
            <Router />
          </div>
          <AppFooter />
        </div>
        <Toaster />
      </WalletContext.Provider>
    </QueryClientProvider>
  );
}

// Add window.ethereum type
declare global {
  interface Window {
    ethereum?: {
      request: (args: any) => Promise<any>;
      on: (event: string, callback: any) => void;
      removeAllListeners: (event: string) => void;
    };
  }
}

export default App;
