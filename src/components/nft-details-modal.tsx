"use client";

import { NFTData } from "~/hooks/use-nft-marketplace";
import { NFTCard } from "./nft-card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Copy, ExternalLink, MessageSquare } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { useProfile } from "~/hooks/use-profile";
import { useMiniAppSdk } from "~/hooks/use-miniapp-sdk";

interface NFTDetailsModalProps {
  nft: NFTData | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected?: boolean;
  onToggleSelection?: (nft: NFTData) => void;
}

export function NFTDetailsModal({
  nft,
  isOpen,
  onClose,
  isSelected = false,
  onToggleSelection,
}: NFTDetailsModalProps) {
  const { toast } = useToast();
  const { username } = useProfile();
  const { sdk } = useMiniAppSdk();

  if (!nft) return null;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDirectMessage = async () => {
    if (!username) {
      toast({
        title: "Username not available",
        description: "Unable to get your username for direct message",
        variant: "destructive",
      });
      return;
    }

    try {
      const frameContext = await sdk.context;
      if (frameContext) {
        // Use composeCast with prefilled text mentioning the username
        await sdk.actions.composeCast({
          text: `Hi @${username}, I'm interested in your NFT: ${nft.name || `#${nft.tokenId}`} (${nft.contractAddress})`,
          embeds: [],
        });
      } else {
        // Fallback to external Warpcast URL
        const composeUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
          `Hi @${username}, I'm interested in your NFT: ${nft.name || `#${nft.tokenId}`} (${nft.contractAddress})`
        )}`;
        window.open(composeUrl, '_blank');
      }
    } catch (error) {
      console.error("Error opening compose:", error);
      toast({
        title: "Unable to open direct message",
        description: "Please try messaging manually",
        variant: "destructive",
      });
    }
  };

  const openEtherscan = () => {
    const baseUrl = nft.network === 'ethereum' 
      ? 'https://etherscan.io'
      : `https://${nft.network}.etherscan.io`;
    const url = `${baseUrl}/token/${nft.contractAddress}?a=${nft.tokenId}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            NFT Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* NFT Image */}
          <div className="flex justify-center">
            <NFTCard
              contractAddress={nft.contractAddress}
              tokenId={nft.tokenId}
              network={nft.network}
              size={280}
              displayOptions={{
                showTitle: false,
                showNetwork: true,
                rounded: "lg",
                shadow: true,
              }}
            />
          </div>

          {/* NFT Information */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">
                {nft.name || `#${nft.tokenId}`}
              </h3>
              {nft.collectionName && (
                <p className="text-sm text-muted-foreground">
                  {nft.collectionName}
                </p>
              )}
            </div>

            {nft.description && (
              <p className="text-sm text-muted-foreground">
                {nft.description}
              </p>
            )}

            {/* Contract Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Contract Address</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-2 py-1 bg-muted rounded text-xs">
                  {nft.contractAddress}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(nft.contractAddress, "Contract address")}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Token ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Token ID</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-2 py-1 bg-muted rounded text-xs">
                  {nft.tokenId}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(nft.tokenId, "Token ID")}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Network */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Network</label>
              <Badge variant="secondary" className="capitalize">
                {nft.network || 'ethereum'}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-4">
            {isSelected && (
              <Badge variant="default" className="bg-green-500 text-white mb-2">
                Currently offered for sale
              </Badge>
            )}

            <Button 
              onClick={handleDirectMessage}
              className="w-full"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Seller
            </Button>

            <Button
              variant="outline"
              onClick={openEtherscan}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Etherscan
            </Button>

            {onToggleSelection && (
              <Button
                variant={isSelected ? "destructive" : "default"}
                onClick={() => onToggleSelection(nft)}
                className="w-full"
              >
                {isSelected ? 'Remove from Sale' : 'Offer for Sale'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}