import { ethers } from "ethers";
import Web3Modal from "web3modal";
import ERC20Generator from "./ERC20Generator.json";
import icoMarketplace from "./icoMarketplace.json";
export const ERC20Generator_ABI = ERC20Generator.abi;
export const ERC20Generator_BYTECODE = ERC20Generator.bytecode;
export const ICO_MARKETPLACE_ADDRESS =
  process.env.NEXT_PUBLIC_ICO_MARKETPLACE_ADDRESS;
export const ICO_MARKETPLACE_ABI = icoMarketplace.abi;
//PINATA KEY
export const PINATA__API_KEY = process.env.NEXT_PUBLIC_PINATA_KEY;
export const PINATA_SECRECT_KEY = process.env.NEXT_PUBLIC_PINATA_SECRECT_KEY;
//NETWORKS
const networks = {
  polygon_amoy: {
    chainId: `0x${Number(80002).toString(16)}`,
    chainName: "Polygon Amoy",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://rpc-amoy.polygon.technology/"],
    blockExplorerUrls: ["https://www.oklink.com/amoy"],
  },
  polygon: {
    chainId: `0x${Number(137).toString(16)}`,
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.ankr.com/polygon/"],
    blockExplorerUrls: ["https://polygonscan.com/"],
  },
};
