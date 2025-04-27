import { useState } from "react";
import NetworkStats from "../components/network-stats";
import BridgeCard from "../components/bridge-card";
import { Skeleton } from "../components/ui/skeleton";

export default function Bridge() {
  const [ isLoadingStats, setIsLoadingStats ] = useState<boolean>(true)

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        {/* {isLoadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-[108px] w-full rounded-xl" />
            <Skeleton className="h-[108px] w-full rounded-xl" />
            <Skeleton className="h-[108px] w-full rounded-xl" />
          </div>
        ) : (
          <NetworkStats
            tvl={"$0"}
            transactions={0}
            volume={"$0"}
          />
        )} */}

        <BridgeCard />

        {/* <RecentTransactions /> */}
      </div>
    </main>
  );
}
