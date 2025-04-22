import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useContext } from "react";
import { WalletContext } from "../lib/wallet";
import { useToast } from "../hooks/use-toast";
import { Progress } from "../components/ui/progress";

export default function Rewards() {
  const wallet = useContext(WalletContext);
  const { toast } = useToast();

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

  // Calculate user reward stats
  const totalStaked = positions?.reduce((acc: any, pos: any) => 
    pos.staked ? acc + parseFloat(pos.amount) : acc, 0) || 0;
  
  const hasStakedPositions = positions?.some((pos: any) => pos.staked) || false;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Staking Rewards</h2>
            <p className="text-neutral-400 max-w-2xl">
              Stake your liquidity pool tokens to earn rewards from bridge fees.
              A 14-day lock period applies to all staked positions.
            </p>
          </div>
          {!wallet.isConnected && (
            <Button 
              onClick={handleConnectWallet} 
              className="mt-4 md:mt-0 bg-primary-600 hover:bg-primary-700"
            >
              Connect Wallet
            </Button>
          )}
        </div>

        {!wallet.isConnected ? (
          <div className="flex flex-col items-center justify-center py-12 bg-neutral-800 rounded-2xl shadow-xl border border-neutral-700">
            <h3 className="text-lg font-medium text-white mb-4">Connect Wallet to View Rewards</h3>
            <p className="text-neutral-400 max-w-md text-center mb-6">
              Connect your wallet to see your staking rewards and earnings
            </p>
            <Button onClick={handleConnectWallet} className="bg-primary-600 hover:bg-primary-700">
              Connect Wallet
            </Button>
          </div>
        ) : isLoadingPositions ? (
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-neutral-800 border-neutral-700">
                <CardContent className="pt-6">
                  <div className="text-sm text-neutral-400 mb-1">Total Value Staked</div>
                  <div className="text-2xl font-bold text-white">${totalStaked.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card className="bg-neutral-800 border-neutral-700">
                <CardContent className="pt-6">
                  <div className="text-sm text-neutral-400 mb-1">Estimated Daily Rewards</div>
                  <div className="text-2xl font-bold text-white">
                    {hasStakedPositions ? (totalStaked * 0.0005).toFixed(4) : "0.0000"} PLS
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-neutral-800 border-neutral-700">
                <CardContent className="pt-6">
                  <div className="text-sm text-neutral-400 mb-1">Claimable Rewards</div>
                  <div className="text-2xl font-bold text-white">0.0000 PLS</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-neutral-800 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-white">Your Staked Positions</CardTitle>
                <CardDescription>
                  View and manage your staked liquidity positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {positions && positions.length > 0 ? (
                  <div className="bg-neutral-900 rounded-xl p-4">
                    <div className="grid grid-cols-12 gap-4 pb-2 text-xs text-neutral-400 mb-2 border-b border-neutral-700">
                      <div className="col-span-3">Pool</div>
                      <div className="col-span-2 text-right">Staked Amount</div>
                      <div className="col-span-2 text-right">APY</div>
                      <div className="col-span-2 text-right">Lock Status</div>
                      <div className="col-span-3 text-right">Earned Rewards</div>
                    </div>
                    
                    {positions.filter((pos: any) => pos.staked).map((position: any) => (
                      <div key={position.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-neutral-700">
                        <div className="col-span-3">
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
                        <div className="col-span-2 text-right">
                          <div className="text-white">${parseFloat(position.amount).toFixed(2)}</div>
                        </div>
                        <div className="col-span-2 text-right">
                          <div className="text-success-500 font-medium">{position.pool.apy}%</div>
                        </div>
                        <div className="col-span-2 text-right">
                          <div className="flex flex-col">
                            <span className="text-xs text-neutral-400 mb-1">14-day lock</span>
                            <Progress value={50} className="h-1.5 bg-neutral-700" />
                            <span className="text-xs text-neutral-400 mt-1">7 days left</span>
                          </div>
                        </div>
                        <div className="col-span-3 text-right">
                          <div className="text-white">0.0000 PLS</div>
                          <Button disabled variant="outline" size="sm" className="text-xs mt-1">
                            Claim
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center bg-neutral-900 rounded-xl">
                    <div className="text-4xl text-neutral-600 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <p className="text-neutral-500">No staked positions found</p>
                    <p className="text-neutral-500 text-sm mt-1">Stake your liquidity to earn rewards</p>
                    <Button className="mt-4 bg-primary-600 hover:bg-primary-700" asChild>
                      <a href="/stake">Go to Staking</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
