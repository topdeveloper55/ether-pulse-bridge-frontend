import React, { useState, useEffect, useContext } from 'react';
import { Pool } from "../pool-card-grid";
import { ethers } from "ethers";
import poolABI from "../../ABI/pool.json";
import tokenABI from "../../ABI/token.json";
import { WalletContext } from "../../lib/wallet";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PoolCard: React.FC<Pool> = ({
  network,
  rpc,
  pool,
  tokenName,
  tokenAddress,
  decimal,
  user,
  stakedAmount
}) => {
  const [totalStaked, setTotalStaked] = useState<number>(0);
  const [userRewards, setUserRewards] = useState<number>(0);
  const [userStaked, setUserStaked] = useState<number>(0);
  const [addAmount, setAddAmount] = useState<number>(0);
  const [allowance, setAllowance] = useState<number>(0);
  const { connectWallet } = useContext(WalletContext);

  const handleAddLiquidity = async () => {
    if (!user) {
      toast("Please connect to wallet.");
      return;
    }
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Set the contract
      const poolContract = new ethers.Contract(pool, poolABI, signer);
      try {
        const tokenAmount = ethers.parseUnits(addAmount.toString(), decimal);
        console.log("token Amount:", tokenAmount)
        const tx = await poolContract.stake(tokenAddress, tokenAmount);
        await tx.wait();
        fetchData();
        toast("Success");
      } catch (error) {
        console.error(error);
        toast("Failed. Try again.")
      }
    } else {
      console.error('No Ethereum provider found. Connect to MetaMask.');
      toast("No Ethereum provider found. Connect to MetaMask.");
    }
  }

  const fetchData = async () => {
    const provider = new ethers.JsonRpcProvider(rpc);
    const poolContract = new ethers.Contract(pool, poolABI, provider);
    try {
      let buf = await poolContract.totalStaked(tokenAddress);
      let realAmount = Number(ethers.formatUnits(buf, decimal));
      setTotalStaked(realAmount);

      if (user) {
        buf = await poolContract.userInfo(tokenAddress, user);
        realAmount = Number(ethers.formatUnits(buf[3], decimal));
        setUserRewards(realAmount);
        realAmount = Number(ethers.formatUnits(buf[2], decimal));
        setUserStaked(realAmount);
      }
    } catch (err) {
      console.log(err);
    }

    if (user) {
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
      try {
        let buf = await tokenContract.allowance(user, pool);
        let realAmount = Number(ethers.formatUnits(buf, decimal));
        console.log("allowance:", realAmount);
        setAllowance(realAmount);
      } catch(err) {
        console.error(err);
      }
    }
  }

  const handleApprove = async () => {
    if(!user) {
      toast("Please connect to wallet.");
      return;
    }
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Set the contract
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
      try {
        const tokenAmount = ethers.parseUnits("100000000", decimal)
        const tx = await tokenContract.approve(pool, tokenAmount);
        await tx.wait();
        fetchData();
        toast("Success");
      } catch (error) {
        console.error(error);
        toast("Failed. Try again.");
      }
    } else {
      console.error('No Ethereum provider found. Connect to MetaMask.');
      toast("No Ethereum provider found. Connect to MetaMask.");
    }
  }

  const handleWithdraw = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Set the contract
      const poolContract = new ethers.Contract(pool, poolABI, signer);
      try {
        const tx = await poolContract.withdraw(tokenAddress);
        await tx.wait();
        fetchData();
        toast("Success");
      } catch (error) {
        console.error(error);
        toast("Failed. Try again.");
      }
    } else {
      console.error('No Ethereum provider found. Connect to MetaMask.');
      toast("No Ethereum provider found. Connect to MetaMask.");
    }
  }

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <div className="w-full sm:w-1/1 md:w-1/2 lg:w-1/3 p-4">
      <div className="rounded-lg shadow-md overflow-hidden transition-shadow transition-transform duration-300 h-full flex flex-col hover:shadow-lg hover:scale-105" style={{ backgroundColor: "honeydew" }}>
        <div className="bg-blue-600 p-4 rounded">
          <h2 className="text-white font-bold text-lg text-center truncate">
            {network}/{tokenName}
          </h2>
        </div>

        <div className='px-4 pb-4'>
          <div className="flex-grow flex items-center justify-center p-6">
            <p className="text-4xl md:text-5xl font-bold text-gray-800 text-center">
              {totalStaked.toFixed(0)}
            </p>
          </div>

          {/* Footer Part - Position and Rewards */}
          {user && <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-2 text-md" style={{color: "blueviolet"}}>
              <p>
                Your Staked Amount: <span className="font-medium">{userStaked.toFixed(2)}</span>
              </p>
              <p>
                Your Rewards: <span className="font-medium">{userRewards.toFixed(2)}</span>
              </p>
            </div>
          </div>}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <input
                onChange={(e) => setAddAmount(Number(e.target.value))}
                type="number"
                className="border border-gray-300 rounded-lg p-2 w-full"
                placeholder="Enter amount"
              />
              <button
                onClick={handleAddLiquidity}
                className="text-white font-bold py-2 px-4 rounded-lg ml-2" style={{backgroundColor: "blueviolet"}}>
                Add
              </button>
            </div>
            {(user && allowance > 0) && <button className="text-white font-bold py-2 px-4 rounded-lg w-full" style={{backgroundColor: "midnightblue"}} onClick={handleWithdraw}>
              Withdraw
            </button>}
            {allowance == 0 && <button className="text-white font-bold py-2 px-4 rounded-lg w-full" style={{backgroundColor: "blueviolet"}} onClick={handleApprove} >
              Approve
            </button>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PoolCard;
