import { useState, useEffect } from 'react';
import { JsonRpcProvider } from '@ethersproject/providers';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { useWeb3 } from './useWeb3';

export interface FounderData {
  totalStartups: number;
  totalInvestors: number;
  totalInvestments: string;
  startupDetails: Array<{
    id: number;
    name: string;
    valuation: string;
    totalShares: string;
    availableShares: string;
    investors: number;
  }>;
}

export const useFounderData = () => {
  const { web3Service, account } = useWeb3();
  const [data, setData] = useState<FounderData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFounderData = async () => {
    if (!web3Service || !account) return;

    try {
      setLoading(true);
      const totalStartups = await web3Service.getTotalStartups();
      let founderStartups = [];
      let totalInvestors = 0;
      let totalInvestments = parseUnits("0", 18);

      // Fetch details for each startup
      for (let i = 1; i <= totalStartups; i++) {
        const startup = await web3Service.getStartupDetails(i);
        if (startup.founder?.toLowerCase() === account.toLowerCase()) {
          const investorCount = await web3Service.getStartupInvestorCount(i);
          const investmentAmount = await web3Service.getStartupTotalInvestment(i);
          
          founderStartups.push({
            id: i,
            name: startup.name,
            valuation: formatUnits(startup.valuation, 18),
            totalShares: formatUnits(startup.totalShares, 18),
            availableShares: formatUnits(startup.availableShares, 18),
            investors: investorCount
          });

          totalInvestors += investorCount;
          totalInvestments += investmentAmount;
        }
      }

      setData({
        totalStartups: founderStartups.length,
        totalInvestors,
        totalInvestments: formatUnits(totalInvestments, 18),
        startupDetails: founderStartups
      });
    } catch (err) {
      console.error('Error fetching founder data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (web3Service && account) {
      fetchFounderData();
    }
  }, [web3Service, account]);

  return { data, loading, fetchFounderData };
};