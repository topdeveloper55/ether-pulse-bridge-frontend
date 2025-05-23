import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent } from "./ui/card";
import { formatDistanceToNow } from "date-fns";
// import { Transaction } from "../types";
import axios from "axios";
import { SERVER_URL } from "../constant";

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);

  const formatChain = (chainId: number): string => {
    if(chainId == 97) return "SmartChain";
    if(chainId == 80002) return "Polygon";
    return "";
  }

  useEffect(() => {
    pollFunc();
    const pollInterval = setInterval(pollFunc, 60000); // Poll every 5 seconds
    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const pollFunc = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/transactions`);
      console.log("txs: ", response.data);
      if (response.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error("Error polling transactions:", error);
    }
  }

  // Format time
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Unknown time";
    }
  };

  // Get appropriate status class
  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-500 bg-opacity-10 text-success-500";
      case "pending":
        return "bg-warning-500 bg-opacity-10 text-warning-500";
      case "failed":
        return "bg-error-500 bg-opacity-10 text-error-500";
      default:
        return "bg-neutral-500 bg-opacity-10 text-neutral-500";
    }
  };

  return (
    <Card className="mt-8 bg-neutral-800 border-neutral-700 rounded-2xl shadow-xl">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>

        {transactions.length == 0 ? (
          <Skeleton className="h-[300px] w-full" />
        ) : transactions && transactions.length > 0 ? (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-700">
              <thead>
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Asset
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    From → To
                  </th>
                  {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Status
                  </th> */}
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700 text-white">
                {transactions.map((tx) => (
                  <tr key={tx.txHash}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {/* <img src={tx.asset.iconUrl} alt={tx.asset.symbol} className="w-5 h-5 mr-2" /> */}
                        <span className="font-medium text-white">{tx.token}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                      {tx.amount}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        <span className="text-white">{formatChain(tx.sourceChain)}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-2 text-neutral-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                        <span className="text-white">{formatChain(tx.targetChain)}</span>
                      </div>
                    </td>
                    {/* <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`}>
                        {!tx.confirmed && (
                          <div className="h-1.5 w-1.5 bg-warning-500 rounded-full mr-1.5 animate-pulse"></div>
                        )}
                        {tx.confirmed && "True"}
                      </span>
                    </td> */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-400">
                      {formatTime(tx.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto text-neutral-600 text-4xl mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p className="text-neutral-500">No transactions yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
