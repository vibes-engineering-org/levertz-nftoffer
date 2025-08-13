import { NextRequest, NextResponse } from 'next/server';

const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;
const OPENSEA_BASE_URL = 'https://api.opensea.io/api/v2';

const WALLET_ADDRESSES = [
  '0x2acfc0d02a4228c249230dcc64a5b58ef7c7a3f0',
  '0x4a3755eb99ae8b22aafb8f16f0c51cf68eb60b85',
  '0xb574b531710e78ec2081bbd34cf8cee2c6cd5dc5',
  '0x566e330b6ea7443cde5492744851507295a3a18e',
  '0xff3dcf79a173ddcf971143c3854ee9ad0a3f3b49'
];

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

interface GroupedNFTs {
  [contractAddress: string]: {
    contractName: string;
    nfts: NFT[];
  };
}

async function fetchNFTsForAddress(address: string): Promise<NFT[]> {
  try {
    const response = await fetch(
      `${OPENSEA_BASE_URL}/chain/ethereum/account/${address}/nfts?limit=200`,
      {
        headers: {
          'X-API-KEY': OPENSEA_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch NFTs for ${address}:`, response.status);
      return [];
    }

    const data = await response.json();
    return data.nfts || [];
  } catch (error) {
    console.error(`Error fetching NFTs for ${address}:`, error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch NFTs from all addresses in parallel
    const nftPromises = WALLET_ADDRESSES.map(address => fetchNFTsForAddress(address));
    const nftResults = await Promise.all(nftPromises);
    
    // Flatten all NFTs into a single array
    const allNFTs = nftResults.flat();
    
    // Group NFTs by contract address
    const groupedNFTs: GroupedNFTs = {};
    
    allNFTs.forEach(nft => {
      const contractAddress = nft.contract;
      
      if (!groupedNFTs[contractAddress]) {
        groupedNFTs[contractAddress] = {
          contractName: nft.collection || contractAddress,
          nfts: []
        };
      }
      
      groupedNFTs[contractAddress].nfts.push(nft);
    });
    
    // Sort NFTs within each contract by token ID (identifier)
    Object.keys(groupedNFTs).forEach(contract => {
      groupedNFTs[contract].nfts.sort((a, b) => {
        const aId = parseInt(a.identifier) || 0;
        const bId = parseInt(b.identifier) || 0;
        return aId - bId;
      });
    });
    
    return NextResponse.json({ 
      success: true, 
      data: groupedNFTs,
      totalNFTs: allNFTs.length
    });
    
  } catch (error) {
    console.error('Error in NFTs API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch NFTs' },
      { status: 500 }
    );
  }
}