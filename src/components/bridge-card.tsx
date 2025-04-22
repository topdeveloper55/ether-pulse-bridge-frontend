import { useState, useEffect, useContext } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { WalletContext } from "../lib/wallet";
import ChainSelectorModal from "./modals/chain-selector-modal";
import AssetSelectorModal from "./modals/asset-selector-modal";
import { ArrowLeftRight, AlertCircle } from "lucide-react";
import { Chain, Asset } from "../types";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CHAINS } from "../constant";

export default function BridgeCard() {
  const { toast } = useToast();
  const wallet = useContext(WalletContext);

  const [showChainModal, setShowChainModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [isFromChain, setIsFromChain] = useState(true);
  const [fromChain, setFromChain] = useState<Chain | null>(null);
  const [toChain, setToChain] = useState<Chain | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [amount, setAmount] = useState("");
  const [isBridging, setIsBridging] = useState(false);

  // Fetch chains
  const { data: chains, isLoading: isLoadingChains } = useQuery({
    queryKey: ["/api/chains"],
  });

  // Fetch assets
  const { data: assets, isLoading: isLoadingAssets } = useQuery({
    queryKey: ["/api/assets"],
  });

  // Set default values after loading
  // useEffect(() => {
  //   if (chains && chains.length >= 2 && !fromChain && !toChain) {
  //     const ethereum = chains.find((chain) => chain.name === "Ethereum");
  //     const pulsechain = chains.find((chain) => chain.name === "PulseChain");
      
  //     if (ethereum && pulsechain) {
  //       setFromChain(ethereum);
  //       setToChain(pulsechain);
  //     } else {
  //       setFromChain(chains[0]);
  //       setToChain(chains[1]);
  //     }
  //   }
  // }, [chains, fromChain, toChain]);

  // useEffect(() => {
  //   if (assets && assets.length > 0 && !selectedAsset) {
  //     // Default to ETH
  //     const eth = assets.find((asset) => asset.symbol === "ETH");
  //     setSelectedAsset(eth || assets[0]);
  //   }
  // }, [assets, selectedAsset]);

  // Create transaction mutation
  const createTransaction = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Transaction Submitted",
        description: "Your bridge transaction has been submitted successfully.",
      });
      setAmount("");
      setIsBridging(false);
    },
    onError: (error) => {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to submit bridge transaction.",
        variant: "destructive",
      });
      setIsBridging(false);
    },
  });

  const handleSwitchChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  const handleChainSelect = (chain: Chain) => {
    if (isFromChain) {
      if (chain.name === toChain?.name) {
        // If selecting the same chain as the "to" chain, switch them
        setFromChain(chain);
        setToChain(fromChain);
      } else {
        setFromChain(chain);
      }
    } else {
      if (chain.name === fromChain?.name) {
        // If selecting the same chain as the "from" chain, switch them
        setToChain(chain);
        setFromChain(toChain);
      } else {
        setToChain(chain);
      }
    }
    setShowChainModal(false);
  };

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowAssetModal(false);
  };

  const handleMaxAmount = () => {
    // In a real implementation, this would use the actual wallet balance
    setAmount("1.2345");
  };

  const calculateFee = () => {
    if (!amount) return "0";
    const value = parseFloat(amount);
    if (isNaN(value)) return "0";
    return (value * 0.03).toFixed(6);
  };

  const calculateReceiveAmount = () => {
    if (!amount) return "0";
    const value = parseFloat(amount);
    if (isNaN(value)) return "0";
    return (value * 0.97).toFixed(6);
  };

  const handleBridgeSubmit = async () => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to proceed with the bridge transaction.",
        variant: "destructive",
      });
      return;
    }

    if (!fromChain || !toChain || !selectedAsset) {
      toast({
        title: "Invalid Selection",
        description: "Please select valid chains and asset.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to bridge.",
        variant: "destructive",
      });
      return;
    }

    setIsBridging(true);

    // In a real implementation, this would call the actual bridge contract
    // Here we're just simulating the bridge transaction
    try {
      const fee = calculateFee();
      const txHash = "0x" + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2);
      
      await createTransaction.mutateAsync({
        txHash,
        fromChain: fromChain.name,
        toChain: toChain.name,
        assetId: selectedAsset.id,
        amount,
        fee,
        status: "pending",
        walletAddress: wallet.address,
      });
      
      // Simulate transaction completion after 5 seconds
      setTimeout(async () => {
        try {
          const res = await fetch(`/api/transactions/${txHash}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "completed" }),
          });
          
          if (res.ok) {
            queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
          }
        } catch (error) {
          console.error("Error updating transaction status:", error);
        }
      }, 5000);
    } catch (error) {
      console.error("Bridge transaction error:", error);
      setIsBridging(false);
      toast({
        title: "Transaction Failed",
        description: "There was an error processing your bridge transaction.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingChains || isLoadingAssets) {
    return (
      <Card className="bg-neutral-800 border-neutral-700 rounded-2xl shadow-xl mb-8">
        <CardContent className="p-6">
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-neutral-800 border-neutral-700 rounded-2xl shadow-xl mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Cross-Chain Bridge</h2>
          
          {/* Chain Selector */}
          <div className="relative mb-6">
            <div className="flex items-center justify-between mb-8">
              {/* From Chain */}
              <div className="w-5/12">
                <div className="text-sm text-neutral-400 mb-2">From</div>
                <Button
                  variant="outline"
                  className="w-full bg-neutral-700 hover:bg-neutral-600 rounded-xl p-4 flex items-center justify-between transition-all border-neutral-600"
                  onClick={() => {
                    setIsFromChain(true);
                    setShowChainModal(true);
                  }}
                >
                  <div className="flex items-center">
                    {fromChain && (
                      <>
                        <img src={fromChain.iconUrl} alt={fromChain.name} className="w-8 h-8 mr-3" />
                        <span className="font-medium text-white">{fromChain.name}</span>
                      </>
                    )}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-neutral-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </Button>
              </div>

              {/* Switch Button */}
              <div className="w-2/12 flex justify-center">
                <Button
                  variant="outline"
                  className="bg-neutral-700 hover:bg-neutral-600 rounded-full p-3 transition-all border-neutral-600"
                  onClick={handleSwitchChains}
                >
                  <ArrowLeftRight className="text-neutral-300" size={18} />
                </Button>
              </div>

              {/* To Chain */}
              <div className="w-5/12">
                <div className="text-sm text-neutral-400 mb-2">To</div>
                <Button
                  variant="outline"
                  className="w-full bg-neutral-700 hover:bg-neutral-600 rounded-xl p-4 flex items-center justify-between transition-all border-neutral-600"
                  onClick={() => {
                    setIsFromChain(false);
                    setShowChainModal(true);
                  }}
                >
                  <div className="flex items-center">
                    {toChain && (
                      <>
                        <img src={toChain.iconUrl} alt={toChain.name} className="w-8 h-8 mr-3" />
                        <span className="font-medium text-white">{toChain.name}</span>
                      </>
                    )}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-neutral-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </Button>
              </div>
            </div>

            {/* Asset Selector */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-neutral-400">Asset</div>
                <div className="text-sm text-neutral-400">
                  Balance: <span>{selectedAsset ? `1.2345 ${selectedAsset.symbol}` : "0"}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full bg-neutral-700 hover:bg-neutral-600 rounded-xl p-4 flex items-center justify-between transition-all border-neutral-600"
                onClick={() => setShowAssetModal(true)}
              >
                {selectedAsset ? (
                  <div className="flex items-center">
                    <img src={selectedAsset.iconUrl} alt={selectedAsset.symbol} className="w-6 h-6 mr-3" />
                    <span className="font-medium text-white">{selectedAsset.symbol}</span>
                  </div>
                ) : (
                  <span className="text-neutral-400">Select Asset</span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" className="text-neutral-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </Button>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-neutral-400">Amount</div>
                <Button
                  variant="link"
                  className="text-xs text-primary-400 hover:text-primary-300 font-medium h-auto p-0"
                  onClick={handleMaxAmount}
                >
                  MAX
                </Button>
              </div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-neutral-700 hover:bg-neutral-600 focus:bg-neutral-600 rounded-xl p-4 text-white text-lg font-medium outline-none focus:ring-2 focus:ring-primary-500 transition-all border-neutral-600"
                />
                {selectedAsset && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400">
                    <span>{selectedAsset.symbol}</span>
                  </div>
                )}
              </div>
            </div>

            {!wallet.isConnected && (
              <Alert className="mb-6 bg-neutral-900 border-amber-600">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-600">Wallet not connected</AlertTitle>
                <AlertDescription className="text-neutral-400">
                  Please connect your wallet to use the bridge.
                </AlertDescription>
              </Alert>
            )}

            {/* Fee Information */}
            <div className="bg-neutral-900 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-neutral-400">Bridge Fee (3%)</div>
                <div className="text-sm text-white font-medium">
                  {calculateFee()} {selectedAsset?.symbol || ""}
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-neutral-400">You will receive</div>
                <div className="text-sm text-white font-medium">
                  {calculateReceiveAmount()} {selectedAsset?.symbol || ""}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-neutral-400">Estimated Time</div>
                <div className="text-sm text-success-500 font-medium">Instant</div>
              </div>
            </div>

            {/* Bridge Button */}
            {!isBridging ? (
              <Button
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-6 rounded-xl transition-all"
                onClick={handleBridgeSubmit}
                disabled={!wallet.isConnected || !amount || parseFloat(amount) <= 0}
              >
                Bridge Asset
              </Button>
            ) : (
              <Button
                disabled
                className="w-full bg-primary-700 text-white font-medium py-6 rounded-xl cursor-not-allowed flex items-center justify-center"
              >
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chain Selector Modal */}
      <ChainSelectorModal
        isOpen={showChainModal}
        onClose={() => setShowChainModal(false)}
        chains={CHAINS || []}
        onSelect={handleChainSelect}
        selectedChain={isFromChain ? fromChain : toChain}
      />

      {/* Asset Selector Modal */}
      <AssetSelectorModal
        isOpen={showAssetModal}
        onClose={() => setShowAssetModal(false)}
        // assets={assets || []}
        assets = {[]}
        onSelect={handleAssetSelect}
        selectedAsset={selectedAsset}
      />
    </>
  );
}
