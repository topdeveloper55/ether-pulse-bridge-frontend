export interface Asset {
  id: number;
  symbol: string;
  name: string;
  iconUrl: string;
  ethereumAddress: string | null;
  pulseChainAddress: string | null;
  decimals: number;
}

interface TokenInfo {
  name: string;
  address: string;
  decimal: number;
}

export interface Chain {
  id: number;
  name: string;
  network: string;
  chainId: number;
  iconUrl: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  pool: string,
  bridge: string,
  tokens: TokenInfo[];
}

export interface Transaction {
  id: number;
  txHash: string;
  fromChain: string;
  toChain: string;
  assetId: number;
  amount: string;
  fee: string;
  status: string;
  walletAddress: string;
  timestamp: string;
  asset: Asset;
}

export interface LiquidityPool {
  id: number;
  name: string;
  token0Id: number;
  token1Id: number;
  category: string;
  tvl: string;
  apy: string;
  token0?: Asset;
  token1?: Asset;
}

export interface UserPosition {
  id: number;
  walletAddress: string;
  poolId: number;
  amount: string;
  staked: boolean;
  stakedAt: string | null;
  lockUntil: string | null;
  pool?: LiquidityPool;
}

export interface NetworkStats {
  tvl: string;
  transactions: number;
  volume: string;
}

export interface StakingReward {
  poolId: number;
  amount: string;
  pendingRewards: string;
  lockEndTime: string;
}

export interface TokenBalance {
  symbol: string;
  balance: string;
  usdValue: string;
}

export interface BridgeFormData {
  fromChainId: number;
  toChainId: number;
  assetId: number;
  amount: string;
}

export interface AddLiquidityFormData {
  poolId: number;
  amount: string;
  staked: boolean;
}

export interface ClaimRewardsRequest {
  walletAddress: string;
  positionIds: number[];
}
