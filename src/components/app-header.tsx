import { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { WalletContext } from "../lib/wallet";
import { useToast } from "../hooks/use-toast";
import { Menu, X } from "lucide-react";

export default function AppHeader() {
  const [location] = useLocation();
  const wallet = useContext(WalletContext);
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleConnectWallet = async () => {
    const connected = await wallet.connectWallet();
    if (!connected) {
      toast({
        title: "Connection Failed",
        description: "Please make sure you have a Web3 wallet installed.",
        variant: "destructive",
      });
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="border-b border-neutral-800 bg-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {/* Logo */}
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <span className="ml-2 text-xl font-bold text-white">PulseBridge</span>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-10 md:flex space-x-8">
              <Link href="/bridge">
                <div className={`px-3 py-2 rounded-md text-sm cursor-pointer ${location === "/bridge" || location === "/" ? "text-white font-medium" : "text-neutral-400 hover:text-primary-400"}`}>
                  Bridge
                </div>
              </Link>
              <Link href="/pools">
                <div className={`px-3 py-2 rounded-md text-sm cursor-pointer ${location === "/pools" ? "text-white font-medium" : "text-neutral-400 hover:text-primary-400"}`}>
                  Pools
                </div>
              </Link>
              {/* <Link href="/stake">
                <div className={`px-3 py-2 rounded-md text-sm cursor-pointer ${location === "/stake" ? "text-white font-medium" : "text-neutral-400 hover:text-primary-400"}`}>
                  Stake
                </div>
              </Link> */}
              {/* <Link href="/rewards">
                <div className={`px-3 py-2 rounded-md text-sm cursor-pointer ${location === "/rewards" ? "text-white font-medium" : "text-neutral-400 hover:text-primary-400"}`}>
                  Rewards
                </div>
              </Link> */}
            </nav>
          </div>

          {/* Connect Wallet Button */}
          <div className="flex items-center">
            {!wallet.isConnected ? (
              <Button 
                onClick={handleConnectWallet} 
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
              >
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center bg-neutral-800 rounded-lg p-1.5 text-sm hover:cursor-pointer" onClick={() => wallet.disconnectWallet()}>
                <div className="h-2 w-2 bg-success-500 rounded-full mr-2"></div>
                <span className="text-white font-mono mr-2">{formatAddress(wallet.address)}</span>
                <div className="bg-neutral-700 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-neutral-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden ml-4">
              <button
                type="button"
                className="text-neutral-400 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800">
          <div className="px-2 py-3 space-y-1 sm:px-3">
            <Link href="/bridge">
              <div 
                className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                  location === "/bridge" || location === "/" 
                    ? "bg-primary-600 text-white" 
                    : "text-neutral-400 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Bridge
              </div>
            </Link>
            <Link href="/pools">
              <div 
                className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                  location === "/pools" 
                    ? "bg-primary-600 text-white" 
                    : "text-neutral-400 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pools
              </div>
            </Link>
            <Link href="/stake">
              <div 
                className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                  location === "/stake" 
                    ? "bg-primary-600 text-white" 
                    : "text-neutral-400 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Stake
              </div>
            </Link>
            <Link href="/rewards">
              <div 
                className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                  location === "/rewards" 
                    ? "bg-primary-600 text-white" 
                    : "text-neutral-400 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Rewards
              </div>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
