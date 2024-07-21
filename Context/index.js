import React, { useState, useContext, createContext, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  ERC20Generator_ABI,
  ERC20Generator_BYTECODE,
  handleNetworkSwitch,
  shortenAddress,
  ICO_MARKETPLACE_ADDRESS,
  ICO_MARKETPLACE_CONTRACT,
  TOKEN_CONTRACT,
  PINATA_SECRECT_KEY,
  PINATA_API_KEY,
} from "./constants";
const StateContext = createContext();
export const StateContextProvider = ({ children }) => {
  const [address, setAddress] = useState();
  const [accountBalance, setAccountBalance] = useState(null);
  const [loader, setLoader] = useState(false);
  const [reCall, setReCall] = useState(0);
  const [currency, setCurrency] = useState("MATIC");
  //COMPONENT
  const [openBuyToken, setOpenBuyToken] = useState(false);
  const [openWithdrawToken, setOpenWithdrawToken] = useState(false);
  const [openTransferToken, setOpenTransferToken] = useState(false);
  const [openTokenCreator, setOpenTokenCreator] = useState(false);
  const [openCreateICO, setOpenCreateICO] = useState(false);
  const notifySuccess = (msg) => toast.success(msg, { duration: 200 });
  const notifyError = (msg) => toast.error(msg, { duration: 200 });
  //FUNCTIONS
  const checkIfwalletConnected = async () => {
    try {
      if (!window.ethereum) return notifyError("No account found");
      await handleNetworkSwitch();
      const accounts = await window.ethereum.request({
        methods: "eth_accounts",
      });
      if (accounts.length) {
        setAddress(accounts[0]);
        const Web3Modal = new Web3Modal();
        const connection = await Web3Modal.connect();
        const provider = ethers.providers.Web3Provider(connection);
        // const provider = ethers.providers.Web3Provider(windoe.ethereum);
        const getbalance = await provider.getBalance(accounts[0]);
        const bal = ethers.utils.formatEther(getbalance);
        setAccountBalance(bal);
        return accounts[0];
      } else {
        notifyError("No account found");
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    checkIfwalletConnected();
  }, [address]);
  const connectWallet = async () => {
    try {
      if (!window.ethereum) return notifyError("No account found");
      await handleNetworkSwitch();
      const accounts = await window.ethereum.request({
        methods: "eth_requestAccounts",
      });
      if (accounts.length) {
        setAddress(accounts[0]);
        const Web3Modal = new Web3Modal();
        const connection = await Web3Modal.connect();
        const provider = ethers.providers.Web3Provider(connection);
        const getbalance = await provider.getBalance(accounts[0]);
        const bal = ethers.utils.formatEther(getbalance);
        setAccountBalance(bal);
        return accounts[0];
      } else {
        notifyError("No account found");
      }
    } catch (error) {
      console.log(error);
    }
  };
  //MAIN FUNCTION
  const _deployContract = async (
    signer,
    account,
    name,
    symbol,
    supply,
    imageURL
  ) => {
    try {
      const factory = new ethers.ContractFactory(
        ERC20Generator_ABI,
        ERC20Generator_BYTECODE,
        signer
      );
      const totalSupply = Number(supply);
      const _initialSupply = ethers.utils.parseEther(
        totalSupply.toString(),
        "ether"
      );
      let contract = await factory.deploy(_initialSupply, name, symbol);
      const transaction = await contract.deployed();
      if (contract.address) {
        const today = Date.now();
        let date = new Date(today);
        const _tokenCreateDate = date.toLocaleDateString("en-US");
        const _token = {
          account: account,
          supply: supply.toString(),
          name: name,
          symbol: symbol,
          tokenAddress: contract.address,
          transactionHash: contract.deployTransaction.hash,
          createdAt: _tokenCreateDate,
          logo: imageURL,
        };
        let tokenHistory = [];
        const history = localStorage.getItem("TOKEN_HISTORY");
        if (history) {
          tokenHistory = JSON.parse(history);
          tokenHistory.push(_token);
          localStorage.setItem("TOKEN_HISTORY", tokenHistory);
          setLoader(false);
          setReCall(reCall + 1);
          setOpenTokenCreator(false);
        } else {
          tokenHistory.push(_token);
          localStorage.setItem("TOKEN_HISTORY", tokenHistory);
          setLoader(false);
          setReCall(reCall + 1);
          setOpenTokenCreator(false);
        }
      }
    } catch (error) {
      setLoader(false);
      notifyError("Something went wrong, try later !");
      console.log(error);
    }
  };
  const createERC20 = async (token, account, imageURL) => {
    const { name, symbol, supply } = token;
    try {
      setLoader(true);
      notifySuccess("Creating token...");
      if (!name || !symbol || !supply) {
        notifyError("Data Missing");
      } else {
        const Web3Modal = new Web3Modal();
        const connection = await Web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        _deployContract(signer, account, name, symbol, supply, imageURL);
      }
    } catch (error) {
      setLoader(false);
      notifyError("Something went wrong, try later !");
      console.log(error);
    }
  };
  const GET_ALL_ICOSALE_TOKEN = async () => {
    try {
      setLoader(true);
      const address = await connectWallet();
      const contract = await ICO_MARKETPLACE_CONTRACT();
      if (address) {
        const allICOSaleTokens = await contract.getAllTokens();
        const _tokenArray = Promise.all(
          allICOSaleTokens.map(async (token) => {
            const tokenContract = await TOKEN_CONTRACT(token?.token);
            const balance = await tokenContract.balanceOf(
              ICO_MARKETPLACE_ADDRESS
            );
            return {
              creator: token.creator,
              token: token.token,
              name: token.name,
              symbol: token.symbol,
              supported: token.supported,
              price: ethers.utils.formatEther(token?.price.toString()),
              icoSaleBal: ethers.utils.formatEther(balance.toString()),
            };
          })
        );
        setLoader(false);
        return _tokenArray;
      }
    } catch (error) {
      notifyError("Something went wrong");
      console.log(error);
    }
  };
  const GET_ALL_USER_ICOSALE_TOKEN = async () => {
    try {
      setLoader(true);
      const address = await connectWallet();
      const contract = await ICO_MARKETPLACE_CONTRACT();
      if (address) {
        const allICOSaleTokens = await contract.getTokenCreatedBy(address);
        const _tokenArray = Promise.all(
          allICOSaleTokens.map(async (token) => {
            const tokenContract = await TOKEN_CONTRACT(token?.token);
            const balance = await tokenContract.balanceOf(
              ICO_MARKETPLACE_ADDRESS
            );
            return {
              creator: token.creator,
              token: token.token,
              name: token.name,
              symbol: token.symbol,
              supported: token.supported,
              price: ethers.utils.formatEther(token?.price.toString()),
              icoSaleBal: ethers.utils.formatEther(balance.toString()),
            };
          })
        );
        setLoader(false);
        return _tokenArray;
      }
    } catch (error) {
      notifyError("Something went wrong");
      console.log(error);
    }
  };
  const createICOSALE = async (icoSale) => {
    try {
      const { address, price } = icoSale;
      if (!address || !price) return notifyError("Data is Missing");
      setLoader(true);
      notifySuccess("Creating icoSale...");
      await connectWallet();
      const contract = await ICO_MARKETPLACE_CONTRACT();
      const payAmount = ethers.utils.parseUnits(price.toString(), "ethers");
      const transaction = await contract.createICOSale(address, payAmount, {
        gasLimit: ethers.utils.hexlify(8000000),
      });
      await transaction.wait();
      if (transaction.hash) {
        setLoader(false);
        setOpenCreateICO(false);
        setReCall(reCall + 1);
      }
    } catch (error) {
      setLoader(false);
      setOpenCreateICO(false);
      notifyError("Something went wrong !");
      console.log(error);
    }
  };
  const buyToken = async (tokenAddress, tokenQuantity) => {
    try {
      setLoader(true);
      notifySuccess("Purchasing token...");
      if (!tokenQuantity || !tokenAddress)
        return notifyError("Data is Missing");
      const address = await connectWallet();
      const contract = await ICO_MARKETPLACE_CONTRACT();
      const _tokenBal = await contract.getBalance(tokenAddress);
      const _tokenDetails = await contract.getTokenDetails(tokenAddress);
      const availableToken = ethers.utils.formatEther(_tokenBal.toString());
      if (availableToken > 0) {
        const price =
          ethers.utils.formatEther(_tokenDetails.price.toString()) *
          Number(tokenQuantity);
        const payAmount = ethers.utils.parseUnits(price.toString(), "ethers");
        const transaction = await contract.buyToken(
          tokenAddress,
          Number(tokenQuantity),
          {
            value: payAmount.toString(),
            gasLimit: ethers.utils.hexlify(8000000),
          }
        );
        await transaction.wait();
        setLoader(false);
        setReCall(reCall + 1);
        setOpenBuyToken(false);
        notifySuccess("Transaction completed successfully");
      } else {
        setLoader(false);
        setOpenBuyToken(false);
      }
    } catch (error) {
      setLoader(false);
      setOpenBuyToken(false);
      notifyError("Something went wrong");
      console.log(error);
    }
  };
  const transferTokens = async (transferTokenData) => {
    try {
      if (
        !transferTokenData.address ||
        !transferTokenData.amount ||
        !transferTokenData.tokenAdd
      )
        return notifyError("Data is Missing");
      setLoader(true);
      notifySuccess("Transaction is processing..");
      const address = await connectWallet();
      const contract = await TOKEN_CONTRACT(transferTokenData.tokenAdd);
      const _availableBal = await contract.balanceOf(address); // checking the balance of user
      const availableToken = ethers.utils.formatEther(_availableBal.toString());
      if (availableToken > 1) {
        const payAmount = ethers.utils.parseUnits(
          transferTokenData.amount.toString(),
          "ethers"
        );
        const transaction = await contract.transfer(
          transferTokenData.address,
          payAmount,
          {
            gasLimit: ethers.utils.hexlify(8000000),
          }
        );
        await transaction.wait();
        setLoader(false);
        setReCall(reCall + 1);
        setOpenTransferToken(false);
        notifySuccess("Transaction completed successfully");
      } else {
        setLoader(false);
        setReCall(reCall + 1);
        setOpenTransferToken(false);
        notifyError("Your balance is 0");
      }
    } catch (error) {
      setLoader(false);
      setReCall(reCall + 1);
      setOpenTransferToken(false);
      notifyError("Something went wrong");
    }
  };
  const withdrawTokens = async (withdrawQuantity) => {
    try {
      if (!withdrawQuantity.amount || !withdrawQuantity / token) {
        return notifyError("Data is missing");
      }
      setLoader(true);
      notifySuccess("Transaction is processing..");
      const contract = ICO_MARKETPLACE_CONTRACT();
      const address = await connectWallet();
      const payAmount = ethers.utils.parseUnits(
        withdrawQuantity.amount.toString(),
        "ether"
      );
      const transaction = await contract.withdraw(
        withdrawQuantity.token,
        payAmount,
        {
          gasLimit: ethers.utils.hexlify(8000000),
        }
      );
      await transaction.wait();
      setLoader(false);
      setReCall(reCall + 1);
      setOpenWithdrawToken(false);
      notifySuccess("Transaction completed successfully");
    } catch (error) {
      setLoader(false);
      setReCall(reCall + 1);
      setOpenWithdrawToken(false);
      notifySuccess("Something went wrong");
      console.log(error);
    }
  };
  return (
    <StateContext.Provider
      value={{
        withdrawTokens,
        transferTokens,
        buyToken,
        createERC20,
        createICOSALE,
        GET_ALL_ICOSALE_TOKEN,
        GET_ALL_ICOSALE_TOKEN,
        connectWallet,
        openBuyToken,
        setOpenBuyToken,
        openWithdrawToken,
        setOpenWithdrawToken,
        openTokenCreator,
        openCreateICO,
        address,
        setAddress,
        accountBalance,
        setAccountBalance,
        currency,
        PINATA_SECRECT_KEY,
        PINATA_API_KEY,
        ICO_MARKETPLACE_ADDRESS,
        shortenAddress,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};
export const useStateContext = () => useContext(StateContext);
