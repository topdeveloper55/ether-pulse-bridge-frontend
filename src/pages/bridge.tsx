import { useState, useContext, useEffect } from "react";
import NetworkStats from "../components/network-stats";
import BridgeCard from "../components/bridge-card";
import { Skeleton } from "../components/ui/skeleton";
import { CHAINS } from "../constant";
import { Pool } from "../components/pool-card-grid";
import { WalletContext } from "../lib/wallet";
import { ethers } from "ethers";
import poolABI from "../ABI/pool.json";
import axios from "axios";
import { SERVER_URL } from "../constant";
import RecentTransactions from "../components/recent-transactions";

export default function Bridge() {
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [tvl, setTvl] = useState<Number>(0);
  const wallet = useContext(WalletContext);
  const [count, setCount] = useState<Number>(0);
  const [volume, setVolume] = useState<Number>(0);

  const fetchTvl = async () => {
    let sum = 0;
    let buf: Pool[] = [];
    for (let i = 0; i < CHAINS.length; i++) {
      for (let j = 0; j < CHAINS[i].tokens.length; j++) {
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
    for (let i = 0; i < buf.length; i++) {
      const provider = new ethers.JsonRpcProvider(buf[i].rpc);
      const poolContract = new ethers.Contract(buf[i].pool, poolABI, provider);
      try {
        const totalStaked = await poolContract.totalStaked(buf[i].tokenAddress);
        const realAmount = Number(ethers.formatUnits(totalStaked, buf[i].decimal));
        if (realAmount > 0) sum += realAmount;
      } catch (err) {
        console.error(err);
        return;
      }
    }
    setTvl(sum);
  }

  const fetchDbData = async () => {
    try {
      let buf = await axios.get(`${SERVER_URL}/count`);
      setCount(buf.data.count);
      buf = await axios.get(`${SERVER_URL}/volume`);
      setVolume(buf.data.totalVolume);
    } catch(err) {
      console.error(err);
      return;
    }
  }

  const fetchData = async () => {
    setIsLoadingStats(true);
    await fetchTvl();
    await fetchDbData();
    setIsLoadingStats(false);
  }

  useEffect(() => {
    fetchData();
  }, [])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        {isLoadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-[81px] bg-gray-500 w-full rounded-xl" />
            <Skeleton className="h-[81px] bg-gray-500 w-full rounded-xl" />
            <Skeleton className="h-[81px] bg-gray-500 w-full rounded-xl" />
          </div>
        ) : (
          <NetworkStats
            tvl={`$${tvl}`}
            transactions={Number(count)}
            volume={`$${volume}`}
          />
        )}

        <BridgeCard />

        <RecentTransactions />
      </div>
    </main>
  );
}
