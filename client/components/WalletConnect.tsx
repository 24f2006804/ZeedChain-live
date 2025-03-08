import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
  Wallet, 
  Loader2, 
  Network,
  LogOut
} from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const WalletConnect = () => {
  const { 
    account, 
    isConnected, 
    isCorrectNetwork, 
    connectWallet,
    switchNetwork,
    disconnectWallet
  } = useWeb3();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const success = await connectWallet();
      if (success) {
        toast.success('Wallet connected successfully!');
      }
    } catch (error) {
      toast.error('Failed to connect wallet. Please try again.');
      console.error('Wallet connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      const success = await disconnectWallet();
      if (success) {
        toast.success('Wallet disconnected successfully!');
      }
    } catch (error) {
      toast.error('Failed to disconnect wallet. Please try again.');
      console.error('Wallet disconnection error:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleNetworkSwitch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await switchNetwork();
  };

  if (isConnected && !isCorrectNetwork) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="destructive"
              className="gap-2"
              onClick={handleNetworkSwitch}
            >
              <Network className="h-5 w-5" />
              Wrong Network
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to switch to EDUChain network</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline"
            className="gap-2 hover:bg-neutral-800"
          >
            <Wallet className="h-5 w-5" />
            {formatAddress(account!)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            className="gap-2 cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-950/30"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
          >
            {isDisconnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Disconnect Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="default"
            className="gap-2"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Wallet className="h-5 w-5" />
            )}
            Connect Wallet
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Connect your wallet</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WalletConnect;