import { useState, useEffect } from 'react';
import { JsonRpcProvider } from '@ethersproject/providers';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { useWeb3 } from './useWeb3';
import { StartupData } from '@/components/ui/startupcard';
import { toast } from 'sonner';
import { useKyc } from './useKyc';

// Specified user address
const SPECIFIED_USER_ADDRESS = "0x6AE9b9f7f404E686a5e762B851394a4708971078";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const useStartups = () => {
  const { web3Service, isConnected, account } = useWeb3();
  const [startups, setStartups] = useState<StartupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingStartup, setIsCreatingStartup] = useState(false);
  const { hasCompletedKyc, KycLevel } = useKyc();

  const fetchStartups = async () => {
    if (!web3Service) return;

    try {
      setLoading(true);
      setError(null);
      const totalStartups = await web3Service.getTotalStartups();
      const startupPromises = [];

      for (let i = 1; i <= totalStartups; i++) {
        startupPromises.push(web3Service.getStartupDetails(i));
      }

      const startupDetails = await Promise.all(startupPromises);
      const formattedStartups = startupDetails.map((startup, index) => ({
        id: index + 1,
        startup_name: startup.name,
        description: startup.description,
        valuation: Number(formatUnits(startup.valuation, 18)),
        total_shares: Number(formatUnits(startup.totalShares, 18)),
        available_shares: Number(formatUnits(startup.availableShares, 18)),
        founder: startup.founder || ZERO_ADDRESS,
        isValidated: startup.isValidated
      }));

      setStartups(formattedStartups);
    } catch (err) {
      console.error('Error fetching startups:', err);
      setError('Failed to fetch startups');
    } finally {
      setLoading(false);
    }
  };

  const invest = async (startupId: number, amount: string) => {
    if (!web3Service || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!hasCompletedKyc) {
      toast.error('Please complete KYC before investing');
      return;
    }

    try {
      const amountInWei = parseUnits(amount, 18);
      await web3Service.invest(startupId, amountInWei);
      toast.success('Investment successful!');
      await fetchStartups(); // Refresh startup data
    } catch (err) {
      console.error('Investment error:', err);
      toast.error('Investment failed. Please try again.');
    }
  };

  useEffect(() => {
    if (web3Service) {
      fetchStartups();
    }
  }, [web3Service]);

  return {
    startups,
    loading,
    error,
    invest,
    fetchStartups,
    isCreatingStartup
  };
};