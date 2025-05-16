import { useState, useEffect, useContext } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { toast } from "react-toastify";
import { WalletContext } from "../lib/wallet";
import ChainSelectorModal from "./modals/chain-selector-modal";
import AssetSelectorModal from "./modals/asset-selector-modal";
import { ArrowLeftRight, AlertCircle } from "lucide-react";
import { Chain } from "../types";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CHAINS } from "../constant";
import { TokenInfo } from "../types";
import { ethers } from "ethers";
import bridgeABI from "../ABI/bridge.json";
import tokenABI from "../ABI/token.json";
import { SERVER_URL } from "../constant";
import axios from "axios";

const delay = async (ms: number | undefined) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function BridgeCard() {
  const wallet = useContext(WalletContext);

  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [showChainModal, setShowChainModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [isFromChain, setIsFromChain] = useState(true);
  const [fromChain, setFromChain] = useState<Chain | null>(null);
  const [toChain, setToChain] = useState<Chain | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState("");
  const [isBridging, setIsBridging] = useState(false);

  // Set default values after loading
  useEffect(() => {
    if (CHAINS && CHAINS.length >= 2 && !fromChain && !toChain) {
      const ethereum = CHAINS.find((chain) => chain.name === "Ethereum");
      const pulsechain = CHAINS.find((chain) => chain.name === "PulseChain");

      if (ethereum && pulsechain) {
        setFromChain(ethereum);
        setToChain(pulsechain);
      } else {
        setFromChain(CHAINS[0]);
        setToChain(CHAINS[1]);
      }
    }
  }, [fromChain, toChain]);

  useEffect(() => {
    fetchAllowance();
  }, [wallet, selectedAsset, fromChain,])

  const fetchAllowance = async () => {
    if (wallet.isConnected && selectedAsset) {
      const provider = new ethers.JsonRpcProvider(fromChain?.rpcUrl);
      const tokenContract = new ethers.Contract(selectedAsset.address, tokenABI, provider);
      try {
        let buf = await tokenContract.allowance(wallet.address, fromChain?.bridge);
        let realAmount = Number(ethers.formatUnits(buf, selectedAsset.decimal));
        if (realAmount > 0) setIsApproved(true);
      } catch (err) {
        console.error(err);
      }
    }
  }

  const isSourceChain = (): boolean => {
    if (wallet.chainId != fromChain?.chainId) {
      toast(`Wrong network. Please connect to ${fromChain?.name}.`);
      return false;
    } else return true;
  }

  const handleApprove = async () => {
    if (window.ethereum && selectedAsset) {
      if (!isSourceChain()) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Set the contract
      const tokenContract = new ethers.Contract(selectedAsset.address, tokenABI, signer);
      const tokenAmount = ethers.parseUnits("100000000", selectedAsset.decimal);
      try {
        const tx = await tokenContract.approve(fromChain?.bridge, tokenAmount);
        await tx.wait();
        setIsApproved(true);
        toast("Success");
      } catch (error) {
        console.error(error);
        toast("Failed. Try again.");
      }
    } else {
      console.error('No Ethereum provider found. Connect to MetaMask.');
      toast("No Ethereum provider found. Connect to MetaMask.");
    }
  }

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

  const handleAssetSelect = (asset: TokenInfo) => {
    setSelectedAsset(asset);
    setShowAssetModal(false);
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

  const isSuccessed = async (txHash: string): Promise<boolean> => {
    for (let i = 0; i < 60; i++) {
      try {
        await delay(10000);
        let buf = await axios.get(`${SERVER_URL}/transactions/${txHash}`);
        if(buf.data.length > 0 && buf.data[0].confirmed) return true;
      } catch (err) {
        console.error(err);
        continue;
      }
    }
    return false;
  }

  const handleBridgeSubmit = async () => {
    if (!wallet.isConnected) {
      toast("Wallet not connected.");
      return;
    }

    if (!fromChain || !toChain || !selectedAsset) {
      toast("Invalid Selection: Please select valid chains and asset.");
      return;
    }

    if (!parseFloat(amount) || parseFloat(amount) <= 0) {
      toast("Invalid Amount: Please enter a valid amount to bridge.");
      return;
    }
    if (!isSourceChain()) return;
    setIsBridging(true);
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Set the contract
      const bridgeContract = new ethers.Contract(fromChain.bridge, bridgeABI, signer);
      try {
        const tokenAmount = ethers.parseUnits(amount.toString(), selectedAsset.decimal);
        const tx = await bridgeContract.lockTokens(wallet.address, selectedAsset.address, tokenAmount, toChain.chainId);
        await tx.wait();
        const uniqueID = await bridgeContract.uniqueID();
        const [from, to, token, amt, chainId, txHash] = await bridgeContract.txInfo(uniqueID);

        const res = await isSuccessed(txHash);
        console.log("res: ", res);
        if(res) {
          toast("Transaction Success.");
          setIsBridging(false);
        }
      } catch (error) {
        console.error(error);
        toast("Transaction Failed");
        setIsBridging(false);
      }
    } else {
      console.error('No Ethereum provider found. Connect to MetaMask.');
      toast("Wallet Not Connected.");
      return;
    }


  };

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
              {/* <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-neutral-400">Asset</div>
                <div className="text-sm text-neutral-400">
                  Balance: <span>{selectedAsset ? `1.2345 ${selectedAsset.symbol}` : "0"}</span>
                </div>
              </div> */}
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

            <div className="mb-6">

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
                <div className="text-sm text-neutral-300 font-medium">Instant</div>
              </div>
            </div>

            {/* Bridge Button */}
            {!isBridging ? (isApproved ?
              <Button
                className="w-full bg-neutral-700 hover:bg-primary-700 text-white font-medium py-6 rounded-xl transition-all"
                onClick={handleBridgeSubmit}
                disabled={!wallet.isConnected || !amount || parseFloat(amount) <= 0}
              >
                Bridge Asset
              </Button> : <Button
                className="w-full bg-neutral-700 hover:bg-primary-700 text-white font-medium py-6 rounded-xl transition-all"
                onClick={handleApprove}
                disabled={!wallet.isConnected || !selectedAsset}
              >
                Approve
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
        assets={fromChain?.tokens || []}
        onSelect={handleAssetSelect}
        selectedAsset={selectedAsset}
      />
    </>
  );
}
