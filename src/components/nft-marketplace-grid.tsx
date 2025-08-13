"use client";

import { useState } from "react";
import { NFTCard } from "./nft-card";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Check, Eye } from "lucide-react";
import { cn } from "~/lib/utils";
import { NFTData } from "~/hooks/use-nft-marketplace";

interface NFTMarketplaceGridProps {
  ownedNFTs: NFTData[];
  selectedNFTs: NFTData[];
  isLoading: boolean;
  onToggleSelection: (nft: NFTData) => void;
  onViewDetails: (nft: NFTData) => void;
  isNFTSelected: (contractAddress: string, tokenId: string) => boolean;
  isConnected: boolean;
}

export function NFTMarketplaceGrid({
  ownedNFTs,
  selectedNFTs,
  isLoading,
  onToggleSelection,
  onViewDetails,
  isNFTSelected,
  isConnected,
}: NFTMarketplaceGridProps) {
  const [view, setView] = useState<'owned' | 'selected'>('owned');

  const displayNFTs = view === 'owned' ? ownedNFTs : selectedNFTs;

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Connect your wallet to view and offer NFTs for sale
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted aspect-square rounded-lg" />
            <div className="mt-2 space-y-2">
              <div className="h-4 bg-muted rounded" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={view === 'owned' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('owned')}
          >
            My NFTs ({ownedNFTs.length})
          </Button>
          <Button
            variant={view === 'selected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('selected')}
          >
            For Sale ({selectedNFTs.length})
          </Button>
        </div>
      </div>

      {/* NFT Grid */}
      {displayNFTs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {view === 'owned' 
              ? 'No NFTs found. Try adding them manually below.'
              : 'No NFTs selected for sale yet. Select NFTs from "My NFTs" to offer them for sale.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayNFTs.map((nft) => {
            const isSelected = isNFTSelected(nft.contractAddress, nft.tokenId);
            
            return (
              <Card key={`${nft.contractAddress}-${nft.tokenId}`} className="relative overflow-hidden">
                <div className="relative">
                  <NFTCard
                    contractAddress={nft.contractAddress}
                    tokenId={nft.tokenId}
                    network={nft.network}
                    size={200}
                    displayOptions={{
                      showTitle: false,
                      showNetwork: false,
                      rounded: "none",
                      shadow: false,
                    }}
                  />
                  
                  {/* Selection Badge */}
                  {isSelected && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" className="bg-green-500 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        For Sale
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-3">
                  <div>
                    <h3 className="font-medium text-sm truncate">
                      {nft.name || `#${nft.tokenId}`}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {nft.collectionName || `${nft.contractAddress.slice(0, 6)}...${nft.contractAddress.slice(-4)}`}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onViewDetails(nft)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    
                    {view === 'owned' && (
                      <Button
                        size="sm"
                        variant={isSelected ? "secondary" : "default"}
                        className="flex-1"
                        onClick={() => onToggleSelection(nft)}
                      >
                        {isSelected ? 'Remove' : 'Offer'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}