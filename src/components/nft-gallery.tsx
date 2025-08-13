'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';

interface NFT {
  identifier: string;
  collection: string;
  contract: string;
  token_standard: string;
  name?: string;
  description?: string;
  image_url?: string;
  metadata_url?: string;
  opensea_url?: string;
}

interface ContractGroup {
  contractName: string;
  nfts: NFT[];
}

interface GroupedNFTs {
  [contractAddress: string]: ContractGroup;
}

interface APIResponse {
  success: boolean;
  data: GroupedNFTs;
  totalNFTs: number;
  error?: string;
}

export default function NFTGallery() {
  const [nftData, setNftData] = useState<GroupedNFTs>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalNFTs, setTotalNFTs] = useState(0);

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/nfts');
      const data: APIResponse = await response.json();
      
      if (data.success) {
        setNftData(data.data);
        setTotalNFTs(data.totalNFTs);
      } else {
        setError(data.error || 'Failed to fetch NFTs');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching NFTs:', err);
    } finally {
      setLoading(false);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openInOpenSea = (nft: NFT) => {
    if (nft.opensea_url) {
      window.open(nft.opensea_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading NFTs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchNFTs} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const contractAddresses = Object.keys(nftData);

  if (contractAddresses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No NFTs found</p>
          <Button onClick={fetchNFTs} variant="outline">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">NFT Collection</h1>
        <p className="text-muted-foreground">
          Displaying {totalNFTs} NFTs across {contractAddresses.length} contracts
        </p>
      </div>

      {contractAddresses.map((contractAddress) => {
        const contractGroup = nftData[contractAddress];
        
        return (
          <div key={contractAddress} className="space-y-4">
            <div className="border-b pb-2">
              <h2 className="text-xl font-semibold">
                {contractGroup.contractName}
              </h2>
              <p className="text-sm text-muted-foreground">
                Contract: {truncateAddress(contractAddress)} • {contractGroup.nfts.length} NFTs
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {contractGroup.nfts.map((nft) => (
                <Card 
                  key={`${nft.contract}-${nft.identifier}`}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openInOpenSea(nft)}
                >
                  <CardContent className="p-3">
                    {nft.image_url && (
                      <div className="aspect-square mb-3 overflow-hidden rounded-md bg-muted">
                        <img
                          src={nft.image_url}
                          alt={nft.name || `Token #${nft.identifier}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm line-clamp-2">
                        {nft.name || `Token #${nft.identifier}`}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground">
                        ID: {nft.identifier}
                      </p>
                      
                      {nft.token_standard && (
                        <p className="text-xs text-muted-foreground">
                          {nft.token_standard}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}