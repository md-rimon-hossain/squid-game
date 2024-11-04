import React, { useState, useEffect, CSSProperties } from "react";
import "./App.css";

import { BrowserProvider, Contract, parseUnits } from "ethers";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
  useWeb3Modal,
} from "@web3modal/ethers/react";
import toast from "react-hot-toast";
import { useUser } from "./UserContext";
import ClipLoader from "react-spinners/ClipLoader";
import { main } from "./images";
const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "#ffffff",
};

const contract = "0x8a827478165B97C2bA31354deCf069C2ce455747";
const abi = [
  {
    inputs: [{ internalType: "address", name: "_token", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "claim",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "totalClaimed",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const Airdrop: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { points, setPoints } = useUser();
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { open } = useWeb3Modal();

  console.log(points);

  useEffect(() => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const userUsername =
        window.Telegram.WebApp.initDataUnsafe.user.username || "Unknown User";
      setUsername(userUsername);
      localStorage.setItem("telegramUsername", userUsername); // Save to localStorage
    }
  }, []);

  const handleCLaim = async () => {
    if (!isConnected) {
      // show an alart
      toast.error("Please connect your wallet first");
      return;
    }
    try {
      const provider = new BrowserProvider(walletProvider!);
      const signer = await provider.getSigner();
      const contractInstance = new Contract(contract, abi, signer);
      // convert 1000 to wei
      const amount = parseUnits(points.toString(), 18);
      // convert 0.001
      const cost = parseUnits("0.001", 18);
      console.log({ cost });
      setLoading(true);
      const claimTx = await contractInstance.claim(amount, {
        value: cost,
      });

      await claimTx.wait();

      setPoints(0);
      setLoading(false);
    } catch (err) {
      toast.error("Error while claiming");
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#000000] flex justify-center h-screen">
      <div className="w-full bg-gradient-to-b from-[#000000] to-[#1c1c1c] text-white h-screen font-bold flex flex-col max-w-xl shadow-lg shadow-[#EA2E33]/50">
        {/* Coin Image */}
        <div className="flex justify-center items-center mt-8">
          <img src={main} alt="Dollar Coin" className="w-32 h-32" />
        </div>

        {/* Header */}
        <div className="text-center mt-4">
          <p
            className="text-4xl text-[#F6E7D4] font-lemon font-normal"
            style={{ textShadow: "1px 1px 2px #EA2E33" }}
          >
            AirDrop
          </p>
        </div>

        {/* Wallet Button */}
        <div className="flex justify-center font-lemon font-normal items-center pt-4">
          <button
            style={{
              padding: "20px 50px",
              backgroundColor: "#FF046B",
              color: "white",
              borderRadius: "14px",
              cursor: "pointer",
            }}
            onClick={
              isConnected
                ? () =>
                    open({
                      view: "Account",
                    })
                : () =>
                    open({
                      view: "Connect",
                    })
            }
          >
            {isConnected
              ? address?.substring(0, 4) +
                "***" +
                address?.substring(address.length - 4, address.length)
              : "Connect Wallet"}
          </button>
        </div>

        {/* Claim Your Coins */}
        <div className="flex justify-center items-center mt-4 md:mt-8 flex-col">
          <p
            style={{
              fontSize: "22px",
              marginBottom: "10px",
              color: "#F6E7D4",
            }}
          >
            Claim Your Coins
          </p>
          <p>{points}</p>
        </div>

        {/* Username */}
        <div className="flex justify-center items-center mt-2">
          <p style={{ fontSize: "20px", color: "#F6E7D4" }}>
            Username: {username}
          </p>
        </div>

        {/* Claim Button */}
        <div className="flex justify-center items-center mt-6">
          <button
            className="font-lemon font-normal"
            style={{
              padding: "20px 50px",
              backgroundColor: "#FF046B",
              color: "white",
              borderRadius: "14px",

              cursor: "pointer",
            }}
            onClick={handleCLaim}
          >
            {loading ? (
              <ClipLoader
                loading={loading}
                cssOverride={override}
                size={25}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            ) : (
              "Claim"
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-center items-center mt-auto mb-6">
          <p className="text-center text-[#51C4C8]">
            More opportunities will be available soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default Airdrop;
