import { CHAIN_CONFIG, NETWORK_CONFIG } from '@/config/web3';
import { parseUnits } from '@ethersproject/units';
import { toast } from 'sonner';

// Add type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Checks if MetaMask is installed
 */
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && !!window.ethereum;
};

/**
 * Checks if the user is connected to the correct network
 */
export const isCorrectNetwork = async (): Promise<boolean> => {
  if (!isMetaMaskInstalled()) return false;
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId.toLowerCase() === NETWORK_CONFIG.chainIdHex.toLowerCase();
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};

/**
 * Switches the network in MetaMask
 */
export const switchNetwork = async (): Promise<boolean> => {
  if (!isMetaMaskInstalled()) {
    toast.error('MetaMask is not installed');
    return false;
  }
  
  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORK_CONFIG.chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [CHAIN_CONFIG],
        });
        return true;
      } catch (addError) {
        console.error('Error adding network:', addError);
        toast.error('Failed to add network to MetaMask');
        return false;
      }
    } else {
      console.error('Error switching network:', switchError);
      toast.error('Failed to switch network');
      return false;
    }
  }
};

/**
 * Handles common MetaMask errors
 */
export const handleMetaMaskError = (error: any): string => {
  console.error('MetaMask error:', error);
  
  if (error.code === 4001) {
    return 'Transaction rejected by user';
  } else if (error.code === -32603) {
    return 'Network error. Please check your MetaMask connection';
  } else if (error.message && error.message.includes('user rejected')) {
    return 'Transaction rejected by user';
  } else if (error.message && error.message.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  } else if (error.message && error.message.includes('nonce')) {
    return 'Transaction nonce error. Try resetting your MetaMask account';
  } else {
    return error.message || 'Unknown error';
  }
};

/**
 * Sends a simple ETH transaction
 */
export const sendEth = async (to: string, amount: string): Promise<any> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  if (!await isCorrectNetwork()) {
    const switched = await switchNetwork();
    if (!switched) {
      throw new Error('Please switch to the correct network');
    }
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const from = accounts[0];
    
    // Convert amount to wei using ethers parseUnits
    const amountInWei = parseUnits(amount, 18).toHexString();
    
    // Send transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from,
          to,
          value: amountInWei,
        },
      ],
    });
    
    return txHash;
  } catch (error) {
    throw new Error(handleMetaMaskError(error));
  }
};