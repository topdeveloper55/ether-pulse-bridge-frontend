import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Asset } from "../../types";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

interface AssetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onSelect: (asset: Asset) => void;
  selectedAsset: Asset | null;
}

export default function AssetSelectorModal({
  isOpen,
  onClose,
  assets,
  onSelect,
  selectedAsset
}: AssetSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssets = assets.filter(asset => 
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-neutral-800 border-neutral-700 text-white">
        <DialogHeader>
          <DialogTitle>Select Asset</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 relative">
          <Input
            type="text"
            placeholder="Search assets"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-primary-500 pl-10 border-neutral-600"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
        </div>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3 pr-4">
            {filteredAssets.map((asset) => (
              <Button
                key={asset.id}
                variant="outline"
                className={`w-full flex items-center p-3 hover:bg-neutral-700 rounded-xl transition-all justify-between ${
                  selectedAsset?.id === asset.id ? "border-primary-500" : "border-neutral-700"
                }`}
                onClick={() => onSelect(asset)}
              >
                <div className="flex items-center">
                  <img src={asset.iconUrl} alt={asset.symbol} className="w-7 h-7 mr-3" />
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium">{asset.symbol}</div>
                    <div className="text-xs text-neutral-400">{asset.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white">1.2345</div>
                  <div className="text-xs text-neutral-400">
                    {asset.symbol === "ETH" 
                      ? "$2,469.00" 
                      : asset.symbol === "USDC" 
                        ? "$1,000.00" 
                        : asset.symbol === "WBTC" 
                          ? "$1,560.00" 
                          : "$0.00"}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
