import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useContext } from "react";
import { WalletContext } from "../lib/wallet";
import { useToast } from "../hooks/use-toast";
import LiquidityPoolsList from "../components/liquidity-pools-list";

export default function Pools() {
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
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Liquidity Pools</h2>
            <p className="text-neutral-400 max-w-2xl">
              Provide liquidity to bridge pools to earn transaction fees and rewards.
              You can supply tokens to any of the available pools below.
            </p>
          </div>
          {/* {!wallet.isConnected && (
            <Button 
              onClick={handleConnectWallet} 
              className="mt-4 md:mt-0 bg-primary-600 hover:bg-primary-700 text-white"
            >
              Connect Wallet
            </Button>
          )} */}
        </div>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">Available Pools</CardTitle>
            <CardDescription>
              Bridge liquidity providers earn 70% of the 3% bridge fee
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingPools ? (
              <div className="space-y-4 mt-4">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
              </div>
            ) : (
              <LiquidityPoolsList 
                pools={[]} 
                userPositions={positions || []} 
                showAddLiquidityButton={true}
              />
            )}
          </CardContent>
        </Card>

        {wallet.isConnected && (
          <Card className="bg-neutral-800 border-neutral-700 mt-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Your Positions</CardTitle>
              <CardDescription>
                View and manage your liquidity positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPositions ? (
                <div className="space-y-4 mt-4">
                  <Skeleton className="h-[100px] w-full rounded-xl" />
                  <Skeleton className="h-[100px] w-full rounded-xl" />
                </div>
              ) : positions && positions.length > 0 ? (
                <div className="bg-neutral-900 rounded-xl p-4 mt-4">
                  <div className="grid grid-cols-6 gap-4 pb-2 text-xs text-neutral-400 mb-2 border-b border-neutral-700">
                    <div className="col-span-2">Pool</div>
                    <div className="col-span-1 text-right">Amount</div>
                    <div className="col-span-1 text-right">Value</div>
                    <div className="col-span-1 text-right">Status</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                  
                  {positions.map((position: any) => (
                    <div key={position.id} className="grid grid-cols-6 gap-4 items-center py-3 border-b border-neutral-700">
                      <div className="col-span-2">
                        <div className="flex items-center">
                          <div className="relative mr-3">
                            <img src={position.pool.token0.iconUrl} alt={position.pool.token0.symbol} className="w-7 h-7" />
                            <img src={position.pool.token1.iconUrl} alt={position.pool.token1.symbol} className="w-7 h-7 absolute -right-3 -bottom-1" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{position.pool.name}</div>
                            <div className="text-xs text-neutral-400">{position.pool.category}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <div className="text-white">{position.amount}</div>
                      </div>
                      <div className="col-span-1 text-right">
                        <div className="text-white">${parseFloat(position.amount).toFixed(2)}</div>
                      </div>
                      <div className="col-span-1 text-right">
                        <div className={`text-sm ${position.staked ? "text-success-500" : "text-neutral-400"}`}>
                          {position.staked ? "Staked" : "Unstaked"}
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <Button variant="outline" size="sm" className="text-xs">
                          {position.staked ? "Unstake" : "Stake"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center bg-neutral-900 rounded-xl mt-4">
                  <div className="text-4xl text-neutral-600 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <p className="text-neutral-500">No positions found</p>
                  <p className="text-neutral-500 text-sm mt-1">Add liquidity to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
