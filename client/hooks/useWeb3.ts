import { useState, useEffect } from 'react';
import type { BrowserProvider } from 'ethers';
import { CHAIN_CONFIG, NETWORK_CONFIG } from '@/config/web3';
import { Web3Service } from '@/services/Web3Service';
import { toast } from 'sonner';

let ethers: typeof import('ethers');

// Dynamic import ethers only on client side
if (typeof window !== 'undefined') {
  import('ethers').then((module) => {
    ethers = module;
  });
}

export interface Web3State {
  provider: BrowserProvider | null;
  web3Service: Web3Service | null;
  chainId: string | null;
  account: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
}

export const useWeb3 = () => {
  const [web3State, setWeb3State] = useState<Web3State>({
    provider: null,
    web3Service: null,
    chainId: null,
    account: null,
    isConnected: false,
    isCorrectNetwork: false,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const switchNetwork = async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_CONFIG.chainId }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CHAIN_CONFIG],
          });
          return true;
        } catch (addError: any) {
          console.error('Error adding network:', addError);
          toast.error('Failed to add network to your wallet');
          return false;
        }
      } else {
        console.error('Error switching network:', switchError);
        toast.error('Failed to switch network');
        return false;
      }
    }
  };

  const isCorrectChainId = (currentChainId: string): boolean => {
    return currentChainId.toLowerCase() === NETWORK_CONFIG.chainIdHex.toLowerCase();
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('Please install MetaMask or another Web3 wallet');
      return false;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (!isCorrectChainId(chainId)) {
        const switched = await switchNetwork();
        if (!switched) return false;
      }

      if (!ethers) {
        ethers = await import('ethers');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const web3Service = new Web3Service(provider);
      await web3Service.init();

      setWeb3State({
        provider,
        web3Service,
        chainId,
        account: accounts[0],
        isConnected: true,
        isCorrectNetwork: isCorrectChainId(chainId),
      });

      // Store connection state in localStorage
      localStorage.setItem('walletConnected', 'true');
      // Clear the manually disconnected flag
      localStorage.removeItem('walletManuallyDisconnected');

      toast.success('Wallet connected successfully!');
      return true;
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('Please connect your wallet to continue');
      } else {
        toast.error('Failed to connect wallet');
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const updateAccount = async (accounts: string[]) => {
    if (!window.ethereum) return;

    if (accounts.length === 0) {
      setWeb3State({
        provider: null,
        web3Service: null,
        chainId: null,
        account: null,
        isConnected: false,
        isCorrectNetwork: false,
      });
      toast.error('Wallet disconnected');
    } else {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });

        if (!ethers) {
          ethers = await import('ethers');
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        
        const web3Service = new Web3Service(provider);
        await web3Service.init();

        setWeb3State({
          provider,
          web3Service,
          chainId,
          account: accounts[0],
          isConnected: true,
          isCorrectNetwork: isCorrectChainId(chainId),
        });

        if (!isCorrectChainId(chainId)) {
          toast.warning('Please switch to the correct network');
        }
      } catch (error) {
        console.error('Error updating account:', error);
        toast.error('Failed to update wallet connection');
      }
    }
  };

  const disconnectWallet = async () => {
    try {
      // Reset the application state
      setWeb3State({
        provider: null,
        web3Service: null,
        chainId: null,
        account: null,
        isConnected: false,
        isCorrectNetwork: false,
      });
      
      // Clear any stored connection data
      localStorage.removeItem('walletConnected');
      // Set a flag to prevent automatic reconnection
      localStorage.setItem('walletManuallyDisconnected', 'true');
      
      // For MetaMask and similar wallets, we can't programmatically disconnect
      // But we can try to force a disconnect by requesting accounts and handling the rejection
      if (window.ethereum) {
        try {
          // This will trigger a wallet popup that the user can cancel, effectively "disconnecting"
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          });
        } catch (error) {
          // Ignore errors here, as the user might reject the request
          console.log('User rejected connection request');
        }
      }
      
      // For WalletConnect
      const ethereum = window.ethereum as any;
      if (ethereum?.isWalletConnect) {
        await ethereum.disconnect();
      }
      
      // For Coinbase Wallet
      if (ethereum?.isCoinbaseWallet) {
        await ethereum.close();
      }
      
      toast.success('Wallet disconnected successfully');
      
      // Force reload the page to ensure all connections are reset
      window.location.reload();
      
      return true;
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
      return false;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Check if wallet was previously connected and not manually disconnected
      const wasConnected = localStorage.getItem('walletConnected') === 'true';
      const wasManuallyDisconnected = localStorage.getItem('walletManuallyDisconnected') === 'true';
      
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0 && wasConnected && !wasManuallyDisconnected) {
            updateAccount(accounts);
          }
        });

      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet through the wallet interface
          localStorage.removeItem('walletConnected');
          localStorage.setItem('walletManuallyDisconnected', 'true');
        }
        updateAccount(accounts);
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', updateAccount);
          window.ethereum.removeListener('chainChanged', () => {});
        }
      };
    }
  }, []);

  return {
    ...web3State,
    connectWallet,
    switchNetwork,
    disconnectWallet,
  };
};