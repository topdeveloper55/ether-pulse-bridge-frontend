import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useContext, useEffect } from "react";
import PoolCardGrid from "../components/pool-card-grid";


export default function Pools() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Liquidity Pools</h2>
            <p className="text-neutral-300 max-w-2xl">
              Provide liquidity to bridge pools to earn transaction fees and rewards.
              You can supply tokens to any of the available pools below.
            </p>
          </div>
        </div>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">Available Pools</CardTitle>
            <CardDescription>
              <p className="text-neutral-300">Bridge liquidity providers earn 50% of the 3% bridge fee</p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PoolCardGrid/>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
