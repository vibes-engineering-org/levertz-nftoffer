"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";

export interface NFTData {
  contractAddress: string;
  tokenId: string;
  name?: string;
  imageUrl?: string;
  network?: string;
  isSelected?: boolean;
  collectionName?: string;
  description?: string;
}

export function useNFTMarketplace() {
  const { address, isConnected } = useAccount();
  const [ownedNFTs, setOwnedNFTs] = useState<NFTData[]>([]);
  const [selectedNFTs, setSelectedNFTs] = useState<NFTData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load selected NFTs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selected-nfts');
    if (saved) {
      try {
        setSelectedNFTs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved NFTs:', e);
      }
    }
  }, []);

  // Save selected NFTs to localStorage
  const saveSelectedNFTs = useCallback((nfts: NFTData[]) => {
    localStorage.setItem('selected-nfts', JSON.stringify(nfts));
    setSelectedNFTs(nfts);
  }, []);

  // Fetch NFTs from OpenSea API
  const fetchNFTsFromOpenSea = useCallback(async (walletAddress: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Using OpenSea API v2
      const response = await fetch(
        `https://api.opensea.io/api/v2/chain/ethereum/account/${walletAddress}/nfts`,
        {
          headers: {
            'X-API-KEY': process.env.NEXT_PUBLIC_OPENSEA_API_KEY || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`OpenSea API error: ${response.status}`);
      }

      const data = await response.json();
      
      const nfts: NFTData[] = data.nfts?.map((nft: any) => ({
        contractAddress: nft.contract,
        tokenId: nft.identifier,
        name: nft.name || `#${nft.identifier}`,
        imageUrl: nft.image_url,
        network: 'ethereum',
        collectionName: nft.collection,
        description: nft.description,
        isSelected: false,
      })) || [];

      // Sort by contract address, then by token ID (lower to higher)
      nfts.sort((a, b) => {
        if (a.contractAddress !== b.contractAddress) {
          return a.contractAddress.localeCompare(b.contractAddress);
        }
        return parseInt(a.tokenId) - parseInt(b.tokenId);
      });

      setOwnedNFTs(nfts);
    } catch (err) {
      console.error('Error fetching NFTs from OpenSea:', err);
      setError('Failed to fetch NFTs. Please try adding them manually.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add NFT manually
  const addNFTManually = useCallback((contractAddress: string, tokenId: string, network: string = 'ethereum') => {
    const newNFT: NFTData = {
      contractAddress: contractAddress.toLowerCase(),
      tokenId,
      network,
      name: `#${tokenId}`,
      isSelected: false,
    };
    
    setOwnedNFTs(prev => {
      const exists = prev.some(nft => 
        nft.contractAddress.toLowerCase() === contractAddress.toLowerCase() && 
        nft.tokenId === tokenId
      );
      
      if (exists) return prev;
      
      const updated = [...prev, newNFT];
      // Sort by contract address, then by token ID
      updated.sort((a, b) => {
        if (a.contractAddress !== b.contractAddress) {
          return a.contractAddress.localeCompare(b.contractAddress);
        }
        return parseInt(a.tokenId) - parseInt(b.tokenId);
      });
      
      return updated;
    });
  }, []);

  // Toggle NFT selection for sale
  const toggleNFTSelection = useCallback((nft: NFTData) => {
    const isCurrentlySelected = selectedNFTs.some(
      selected => selected.contractAddress === nft.contractAddress && selected.tokenId === nft.tokenId
    );

    if (isCurrentlySelected) {
      // Remove from selected
      const updated = selectedNFTs.filter(
        selected => !(selected.contractAddress === nft.contractAddress && selected.tokenId === nft.tokenId)
      );
      saveSelectedNFTs(updated);
    } else {
      // Add to selected
      const updated = [...selectedNFTs, { ...nft, isSelected: true }];
      saveSelectedNFTs(updated);
    }
  }, [selectedNFTs, saveSelectedNFTs]);

  // Check if NFT is selected
  const isNFTSelected = useCallback((contractAddress: string, tokenId: string) => {
    return selectedNFTs.some(
      nft => nft.contractAddress === contractAddress && nft.tokenId === tokenId
    );
  }, [selectedNFTs]);

  // Initialize by fetching NFTs if wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      fetchNFTsFromOpenSea(address);
    }
  }, [isConnected, address, fetchNFTsFromOpenSea]);

  return {
    ownedNFTs,
    selectedNFTs,
    isLoading,
    error,
    isConnected,
    address,
    fetchNFTsFromOpenSea,
    addNFTManually,
    toggleNFTSelection,
    isNFTSelected,
  };
}