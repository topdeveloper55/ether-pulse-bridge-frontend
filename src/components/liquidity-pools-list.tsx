import { useState, useContext } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LiquidityPool, UserPosition } from "../types";
import { WalletContext } from "../lib/wallet";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

interface LiquidityPoolsListProps {
  pools: LiquidityPool[];
  userPositions?: UserPosition[];
  showAddLiquidityButton?: boolean;
}

export default function LiquidityPoolsList({ 
  pools, 
  userPositions = [], 
  showAddLiquidityButton = true 
}: LiquidityPoolsListProps) {
  const wallet = useContext(WalletContext);
  const { toast } = useToast();
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [liquidityAmount, setLiquidityAmount] = useState("");

  const addLiquidityMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/user-positions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-positions", wallet.address] });
      toast({
        title: "Liquidity Added",
        description: "Your liquidity has been added successfully.",
      });
      setShowDialog(false);
      setLiquidityAmount("");
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Liquidity",
        description: error.message || "An error occurred while adding liquidity.",
        variant: "destructive",
      });
    },
  });

  const handleAddLiquidity = (pool: LiquidityPool) => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to add liquidity.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedPool(pool);
    setShowDialog(true);
  };

  const handleAddLiquiditySubmit = async () => {
    if (!selectedPool || !liquidityAmount || parseFloat(liquidityAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to add.",
        variant: "destructive",
      });
      return;
    }

    await addLiquidityMutation.mutateAsync({
      walletAddress: wallet.address,
      poolId: selectedPool.id,
      amount: liquidityAmount,
      staked: false,
    });
  };

  // Function to find user position for a pool
  const getUserPositionForPool = (poolId: number) => {
    return userPositions.find(position => position.poolId === poolId);
  };

  return (
    <>
      <div className="bg-neutral-900 rounded-xl p-4">
        <div className="grid grid-cols-6 gap-4 pb-2 text-xs text-neutral-400 mb-2 border-b border-neutral-700">
          <div className="col-span-2">Pool</div>
          <div className="col-span-1 text-right">APY</div>
          <div className="col-span-1 text-right">TVL</div>
          <div className="col-span-2 text-right">Your Position</div>
        </div>
        
        {pools.length > 0 ? (
          pools.map((pool) => {
            const userPosition = getUserPositionForPool(pool.id);
            const formattedTvl = `$${(parseFloat(pool.tvl) / 1000000).toFixed(1)}M`;
            
            return (
              <div key={pool.id} className="grid grid-cols-6 gap-4 items-center py-3 border-b border-neutral-700">
                <div className="col-span-2">
                  <div className="flex items-center">
                    <div className="relative mr-3">
                      {pool.token0 && pool.token1 ? (
                        <>
                          <img src={pool.token0.iconUrl} alt={pool.token0.symbol} className="w-7 h-7" />
                          <img src={pool.token1.iconUrl} alt={pool.token1.symbol} className="w-7 h-7 absolute -right-3 -bottom-1" />
                        </>
                      ) : (
                        <div className="w-7 h-7 bg-neutral-700 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">{pool.name}</div>
                      <div className="text-xs text-neutral-400">{pool.category}</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 text-right">
                  <div className="text-success-500 font-medium">{pool.apy}%</div>
                </div>
                <div className="col-span-1 text-right">
                  <div className="text-white">{formattedTvl}</div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-white">
                    {userPosition ? `$${parseFloat(userPosition.amount).toFixed(2)}` : '$0'}
                  </div>
                  {showAddLiquidityButton && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all border-primary-700"
                      onClick={() => handleAddLiquidity(pool)}
                    >
                      Add
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-neutral-500">
            No pools available
          </div>
        )}
      </div>

      {/* Add Liquidity Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-neutral-800 border-neutral-700 text-white">
          <DialogHeader>
            <DialogTitle>Add Liquidity</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Add liquidity to the {selectedPool?.name} pool.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedPool && (
              <div className="flex items-center mb-4">
                <div className="relative mr-3">
                  {selectedPool.token0 && selectedPool.token1 ? (
                    <>
                      <img src={selectedPool.token0.iconUrl} alt={selectedPool.token0.symbol} className="w-8 h-8" />
                      <img src={selectedPool.token1.iconUrl} alt={selectedPool.token1.symbol} className="w-8 h-8 absolute -right-3 -bottom-1" />
                    </>
                  ) : (
                    <div className="w-8 h-8 bg-neutral-700 rounded-full"></div>
                  )}
                </div>
                <div className="ml-2">
                  <div className="text-lg font-semibold">{selectedPool.name}</div>
                  <div className="text-sm text-neutral-400">{selectedPool.category}</div>
                </div>
                <div className="ml-auto">
                  <div className="text-success-500 font-medium">{selectedPool.apy}% APY</div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={liquidityAmount}
                onChange={(e) => setLiquidityAmount(e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              className="border-neutral-600 text-neutral-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddLiquiditySubmit}
              className="bg-primary-600 hover:bg-primary-700"
              disabled={addLiquidityMutation.isPending}
            >
              {addLiquidityMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : "Add Liquidity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
