import { Chain } from "./types"

export const CHAINS: Chain[] = [
    {
        id: 1,
        name: "BNB Smart Chain Testnet",
        network: "Testnet",
        chainId: 97,
        iconUrl: "https://assets.crypto.ro/logos/bnb-bnb-logo.png",
        rpcUrl: "https://bsc-testnet.publicnode.com",
        blockExplorerUrl: "https://testnet.bscscan.com"
    },
    {
        id: 2,
        name: "Sepolia",
        network: "Testnet",
        chainId: 11155111,
        iconUrl: "https://assets.crypto.ro/logos/ethereum-eth-logo.png",
        rpcUrl: "https://sepolia.infura.io",
        blockExplorerUrl: "https://sepolia.etherscan.io"
    }
]