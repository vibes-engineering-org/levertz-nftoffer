"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "~/hooks/use-toast";

interface AddNFTFormProps {
  onAddNFT: (contractAddress: string, tokenId: string, network: string) => void;
}

const SUPPORTED_NETWORKS = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'base', label: 'Base' },
  { value: 'arbitrum', label: 'Arbitrum' },
  { value: 'optimism', label: 'Optimism' },
  { value: 'polygon', label: 'Polygon' },
];

export function AddNFTForm({ onAddNFT }: AddNFTFormProps) {
  const [contractAddress, setContractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [network, setNetwork] = useState('ethereum');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isValidEthereumAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const isValidTokenId = (id: string) => {
    return /^\d+$/.test(id) && parseInt(id) >= 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contractAddress.trim() || !tokenId.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both contract address and token ID",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEthereumAddress(contractAddress.trim())) {
      toast({
        title: "Invalid contract address",
        description: "Please enter a valid Ethereum contract address",
        variant: "destructive",
      });
      return;
    }

    if (!isValidTokenId(tokenId.trim())) {
      toast({
        title: "Invalid token ID",
        description: "Token ID must be a valid number",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onAddNFT(contractAddress.trim(), tokenId.trim(), network);
      
      // Clear form
      setContractAddress('');
      setTokenId('');
      setNetwork('ethereum');
      
      toast({
        title: "NFT added successfully",
        description: "The NFT has been added to your collection",
      });
    } catch (error) {
      toast({
        title: "Failed to add NFT",
        description: "There was an error adding the NFT",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add NFT Manually
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="contract">Contract Address</Label>
              <Input
                id="contract"
                type="text"
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                The contract address of the NFT collection
              </p>
            </div>

            <div>
              <Label htmlFor="tokenId">Token ID</Label>
              <Input
                id="tokenId"
                type="text"
                placeholder="1"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                The specific token ID of the NFT
              </p>
            </div>

            <div>
              <Label htmlFor="network">Network</Label>
              <Select value={network} onValueChange={setNetwork} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_NETWORKS.map((net) => (
                    <SelectItem key={net.value} value={net.value}>
                      {net.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                The blockchain network where the NFT exists
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !contractAddress.trim() || !tokenId.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding NFT...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add NFT
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}