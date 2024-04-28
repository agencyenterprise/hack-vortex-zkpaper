import { ScrollSepoliaTestnet, Localhost } from "@thirdweb-dev/chains"
import { CONTRACT_ADDRESSES } from "@thirdweb-dev/sdk"

export const APP_ENV = import.meta.env.VITE_APP_ENV
export const NETWORK = APP_ENV === "local" ? Localhost : ScrollSepoliaTestnet
export const CONTRACT_ADDRESS = import.meta.env.VITE_APP_CONTRACT_ADDRESS