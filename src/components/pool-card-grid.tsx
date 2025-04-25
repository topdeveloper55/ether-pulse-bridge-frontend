import React, { useState } from 'react';
import { useContext, useEffect } from 'react';
import PoolCard from './ui/poolcard';
import { WalletContext } from "../lib/wallet";
import { CHAINS } from "../constant";
import { ethers } from "ethers";
import poolABI from "../ABI/pool.json";

export interface Pool {
  network: string;
  rpc: string;
  pool: string;
  tokenName: string;
  tokenAddress: string;
  decimal: number;
  user: string;
  stakedAmount: number;
}

const PoolCardGrid = () => {
  const wallet = useContext(WalletContext);
  const [pools, setPools] = useState<Pool[]>([]);

  const fetchYourStaked = async () => {
    let buf: Pool[] = [];
    for(let i = 0 ; i < CHAINS.length ; i ++) {
      for(let j = 0 ; j < CHAINS[i].tokens.length ; j ++) {
        buf.push({
          network: CHAINS[i].name,
          rpc: CHAINS[i].rpcUrl,
          pool: CHAINS[i].pool,
          tokenName: CHAINS[i].tokens[j].name,
          tokenAddress: CHAINS[i].tokens[j].address,
          decimal: CHAINS[i].tokens[j].decimal,
          user: wallet.address || "",
          stakedAmount: 0
        });
      }
    }
    for(let i = 0 ; i < buf.length ; i ++) {
      const provider = new ethers.JsonRpcProvider(buf[i].rpc);
      const poolContract = new ethers.Contract(buf[i].pool, poolABI, provider);
      try {
        if(wallet.address) {
          const userStaked = await poolContract.userInfo(buf[i].tokenAddress, wallet.address);
          const realAmount = Number(ethers.formatUnits(userStaked[2], buf[i].decimal));
          if(realAmount > 0) buf[i].stakedAmount = realAmount;
        }
      } catch(err) {
        console.log(err);
        continue;
      }
    }
    setPools(buf);
  }

  useEffect(() => {
    fetchYourStaked();
  }, [wallet])

  return (
    <div className="min-h-screen bg-gray-100 p-6 rounded bg-neutral-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Pool Dashboard</h1>
        <div className="flex flex-wrap -mx-4">
          {pools.map((pool, index) => (
            <PoolCard
              key={index}
              network={pool.network}
              rpc={pool.rpc}
              pool={pool.pool}
              tokenName={pool.tokenName}
              tokenAddress={pool.tokenAddress}
              decimal={pool.decimal}
              user={pool.user}
              stakedAmount={pool.stakedAmount}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PoolCardGrid;