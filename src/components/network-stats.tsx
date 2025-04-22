import { Card, CardContent } from "./ui/card";

interface NetworkStatsProps {
  tvl: string;
  transactions: number;
  volume: string;
}

export default function NetworkStats({ tvl, transactions, volume }: NetworkStatsProps) {
  // Format numbers with commas
  const formatNumber = (num: string | number) => {
    if (typeof num === "string") {
      // If it's a currency string (starts with $)
      if (num.startsWith("$")) {
        const value = parseFloat(num.substring(1).replace(/,/g, ""));
        return `$${value.toLocaleString()}`;
      }
      // If it's a regular number string
      return parseFloat(num).toLocaleString();
    }
    // If it's a number
    return num.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-neutral-800 border-neutral-700">
        <CardContent className="p-6">
          <div className="text-sm text-neutral-400 mb-1">Total Value Locked</div>
          <div className="text-2xl font-bold text-white">{formatNumber(tvl)}</div>
        </CardContent>
      </Card>
      <Card className="bg-neutral-800 border-neutral-700">
        <CardContent className="p-6">
          <div className="text-sm text-neutral-400 mb-1">24h Transactions</div>
          <div className="text-2xl font-bold text-white">{formatNumber(transactions)}</div>
        </CardContent>
      </Card>
      <Card className="bg-neutral-800 border-neutral-700">
        <CardContent className="p-6">
          <div className="text-sm text-neutral-400 mb-1">24h Bridge Volume</div>
          <div className="text-2xl font-bold text-white">{formatNumber(volume)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
