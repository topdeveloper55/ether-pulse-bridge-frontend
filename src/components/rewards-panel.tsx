import { Button } from "./ui/button";
import { UserPosition } from "../types";

interface RewardsPanelProps {
  positions: UserPosition[];
  totalStaked: string;
  avgApy: string;
}

export default function RewardsPanel({ positions, totalStaked, avgApy }: RewardsPanelProps) {
  // Calculate user stake total
  const yourStake = positions
    .filter(pos => pos.staked)
    .reduce((total, pos) => total + parseFloat(pos.amount), 0)
    .toFixed(2);
  
  // Calculate if user has any rewards
  const hasRewards = positions.some(pos => pos.staked);

  return (
    <>
      <h3 className="text-lg font-bold text-white mb-4">Staking Rewards</h3>
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-neutral-400 text-sm">Total Staked</span>
          <span className="text-white font-medium">{totalStaked}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-neutral-400 text-sm">Your Stake</span>
          <span className="text-white font-medium">${yourStake}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400 text-sm">Avg. APY</span>
          <span className="text-success-500 font-medium">{avgApy}</span>
        </div>
      </div>
      
      <div className="bg-neutral-800 rounded-lg p-4 mb-6">
        <div className="mb-4">
          <div className="text-sm text-neutral-400 mb-1">Your Rewards</div>
          <div className="text-xl font-bold text-white">
            {hasRewards ? "0.00312 PLS" : "0.00 PLS"}
          </div>
        </div>
        <Button
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!hasRewards}
        >
          Claim Rewards
        </Button>
      </div>
      
      <div className="text-neutral-400 text-sm">
        <div className="flex items-start mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>Staking your LP tokens earns you a share of bridge transaction fees plus additional PLS rewards</span>
        </div>
        <div className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>14-day lock period applies to all staked positions</span>
        </div>
      </div>
    </>
  );
}
