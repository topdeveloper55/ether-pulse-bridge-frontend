import { Chain } from "./types"

export const CHAINS: Chain[] = [
    {
        id: 1,
        name: "SmartChain",
        network: "Testnet",
        chainId: 97,
        iconUrl: "https://assets.crypto.ro/logos/bnb-bnb-logo.png",
        rpcUrl: "https://bsc-testnet.publicnode.com",
        blockExplorerUrl: "https://testnet.bscscan.com",
        pool: "0xDA89eeeba6414b7c9A4EE28FE8353B226D6Ee0E9",    
        bridge: "0x738b20A864BA1766899cB713fFB1E7848aFbBa5e",
        tokens: [{name: "USDC", address: "0xA3112c1eADA97dd4cA15685789C4ba622ad62E2a", decimal: 6, symbol: "USDC", iconUrl: "https://assets.crypto.ro/logos//usd-coin-usdc-logo.png"}]
    },
    {
        id: 2,
        name: "Sepolia",
        network: "Testnet",
        chainId: 11155111,
        iconUrl: "https://assets.crypto.ro/logos/ethereum-eth-logo.png",
        rpcUrl: "https://sepolia.infura.io",
        blockExplorerUrl: "https://sepolia.etherscan.io",
        pool: "0x26D75d588BA18B85d1f497A4CC65685e9bcFE527",
        bridge: "",
        tokens: [{ name: "USDC", address: "0xA3112c1eADA97dd4cA15685789C4ba622ad62E2a", decimal: 6, symbol: "USDC", iconUrl: "" }]
    }
]
