import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Chain } from "../../types";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";

interface ChainSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  chains: Chain[];
  onSelect: (chain: Chain) => void;
  selectedChain: Chain | null;
}

export default function ChainSelectorModal({
  isOpen,
  onClose,
  chains,
  onSelect,
  selectedChain
}: ChainSelectorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-neutral-800 border-neutral-700 text-white">
        <DialogHeader>
          <DialogTitle>Select Chain</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3 pr-4">
            {chains.map((chain) => (
              <Button
                key={chain.id}
                variant="outline"
                className={`w-full flex items-center p-3 hover:bg-neutral-700 rounded-xl transition-all justify-between ${
                  selectedChain?.id === chain.id ? "border-primary-500" : "border-neutral-700"
                }`}
                onClick={() => onSelect(chain)}
              >
                <div className="flex items-center">
                  <img src={chain.iconUrl} alt={chain.name} className="w-7 h-7 mr-3" />
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium">{chain.name}</div>
                    <div className="text-xs text-neutral-400">{chain.network}</div>
                  </div>
                </div>
                {selectedChain?.id === chain.id && (
                  <div className="h-3 w-3 bg-success-500 rounded-full"></div>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
