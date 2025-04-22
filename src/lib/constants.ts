export const CHAIN_IDS = {
  ETHEREUM: 1,
  PULSECHAIN: 369,
};

export const RPC_URLS = {
  [CHAIN_IDS.ETHEREUM]: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  [CHAIN_IDS.PULSECHAIN]: "https://rpc.pulsechain.com",
};

export const BRIDGE_FEE_PERCENTAGE = 0.03; // 3%
export const LIQUIDITY_PROVIDER_SHARE = 0.70; // 70% of the fee goes to LPs
export const STAKING_LOCK_PERIOD_DAYS = 14; // 14-day lock period

export const DEFAULT_CHAIN_ICON = "https://raw.githubusercontent.com/ethereum/ethereum-org-website/dev/src/assets/eth-logo.png";
export const DEFAULT_CHAIN_NAME = "Unknown Chain";

export const STAKING_APY_RANGE = {
  MIN: 15.2,
  MAX: 24.5,
  AVG: 18.7,
};
