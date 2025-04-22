import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../components/ui/skeleton";
import LiquidityPoolsList from "../components/liquidity-pools-list";
import RewardsPanel from "../components/rewards-panel";
import { useContext } from "react";
import { WalletContext } from "../lib/wallet";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";

export default function Stake() {
  const wallet = useContext(WalletContext);
  const { toast } = useToast();

  const { data: pools, isLoading: isLoadingPools } = useQuery({
    queryKey: ["/api/liquidity-pools"],
  });

  const { data: positions, isLoading: isLoadingPositions } = useQuery({
    queryKey: ["/api/user-positions", wallet.address],
    queryFn: async ({ queryKey }) => {
      if (!wallet.isConnected) return [];
      const res = await fetch(`/api/user-positions?walletAddress=${queryKey[1]}`);
      if (!res.ok) throw new Error("Failed to fetch positions");
      return res.json();
    },
    enabled: wallet.isConnected,
  });

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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mt-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-8">Liquidity Pools & Staking</h2>

        {!wallet.isConnected ? (
          <div className="flex flex-col items-center justify-center py-12 bg-neutral-800 rounded-2xl shadow-xl border border-neutral-700">
            <h3 className="text-lg font-medium text-white mb-4">Connect Wallet to Stake</h3>
            <p className="text-neutral-400 max-w-md text-center mb-6">
              Connect your wallet to stake in liquidity pools and earn fee-sharing rewards
            </p>
            <Button onClick={handleConnectWallet} className="bg-primary-600 hover:bg-primary-700">
              Connect Wallet
            </Button>
          </div>
        ) : (
          <div className="bg-neutral-800 rounded-2xl p-6 shadow-xl border border-neutral-700 mb-8">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3 pr-0 md:pr-6 mb-6 md:mb-0">
                <h3 className="text-lg font-bold text-white mb-4">Provide Liquidity</h3>
                <p className="text-neutral-300 mb-6">
                  Supply tokens to the bridge liquidity pools and earn transaction fees plus PLS rewards. 
                  Bridge liquidity providers earn 70% of the 3% bridge fee.
                </p>

                {isLoadingPools ? (
                  <div className="space-y-4">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                  </div>
                ) : (
                  <LiquidityPoolsList pools={[]} userPositions={positions || []} />
                )}
              </div>

              <div className="md:w-1/3 bg-neutral-900 rounded-xl p-6">
                {isLoadingPositions ? (
                  <div className="space-y-4">
                    <Skeleton className="h-[150px] w-full rounded-xl" />
                    <Skeleton className="h-[100px] w-full rounded-xl" />
                  </div>
                ) : (
                  <RewardsPanel 
                    positions={positions || []} 
                    totalStaked="$5,246,789" 
                    avgApy="18.7%" 
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
