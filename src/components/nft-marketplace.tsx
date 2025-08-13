"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useNFTMarketplace, NFTData } from "~/hooks/use-nft-marketplace";
import { NFTMarketplaceGrid } from "./nft-marketplace-grid";
import { NFTDetailsModal } from "./nft-details-modal";
import { AddNFTForm } from "./add-nft-form";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { Wallet, RefreshCw, Plus } from "lucide-react";

export function NFTMarketplace() {
  const { isConnected } = useAccount();
  const {
    ownedNFTs,
    selectedNFTs,
    isLoading,
    error,
    address,
    fetchNFTsFromOpenSea,
    addNFTManually,
    toggleNFTSelection,
    isNFTSelected,
  } = useNFTMarketplace();

  const [selectedNFT, setSelectedNFT] = useState<NFTData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleViewDetails = (nft: NFTData) => {
    setSelectedNFT(nft);
    setIsDetailsModalOpen(true);
  };

  const handleRefresh = async () => {
    if (address) {
      await fetchNFTsFromOpenSea(address);
    }
  };

  const handleAddNFTManually = (contractAddress: string, tokenId: string, network: string) => {
    addNFTManually(contractAddress, tokenId, network);
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold">Connect Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Connect your wallet to view and offer NFTs for sale
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">NFT Marketplace</h1>
        <p className="text-muted-foreground">
          Manage your NFTs and offer them for sale
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh from OpenSea
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add NFT Manually
        </Button>
      </div>

      {/* Add NFT Form */}
      {showAddForm && (
        <div className="max-w-md mx-auto">
          <AddNFTForm onAddNFT={handleAddNFTManually} />
        </div>
      )}

      {showAddForm && <Separator />}

      {/* NFT Grid */}
      <NFTMarketplaceGrid
        ownedNFTs={ownedNFTs}
        selectedNFTs={selectedNFTs}
        isLoading={isLoading}
        onToggleSelection={toggleNFTSelection}
        onViewDetails={handleViewDetails}
        isNFTSelected={isNFTSelected}
        isConnected={isConnected}
      />

      {/* NFT Details Modal */}
      <NFTDetailsModal
        nft={selectedNFT}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedNFT(null);
        }}
        isSelected={selectedNFT ? isNFTSelected(selectedNFT.contractAddress, selectedNFT.tokenId) : false}
        onToggleSelection={toggleNFTSelection}
      />
    </div>
  );
}