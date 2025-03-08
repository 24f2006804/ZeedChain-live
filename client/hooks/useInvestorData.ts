import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { ethers } from 'ethers';

export interface InvestorData {
  investments: {
    startupId: number;
    shares: number;
    investmentAmount: string;
    timestamp: number;
    sharePrice: string;
  }[];
  totalInvested: string;
  totalProfits: string;
  activeInvestments: number;
  portfolioValue: string;
  performanceMetrics: {
    monthly: number[];
    labels: string[];
  };
}

export const useInvestorData = () => {
  const { web3Service, account, isConnected } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InvestorData | null>(null);

  const fetchInvestorData = async () => {
    if (!web3Service?.contracts.fractionalInvestment || !account || !isConnected) {
      return;
    }

    try {
      setLoading(true);

      // For now, let's use mock data since we're having issues with the contract calls
      // In a production environment, we would properly implement these calls
      
      // Mock investment data
      const mockInvestments = [
        {
          startupId: 1,
          shares: 100,
          investmentAmount: "0.5",
          timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
          sharePrice: "0.005"
        },
        {
          startupId: 2,
          shares: 200,
          investmentAmount: "1.0",
          timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
          sharePrice: "0.005"
        },
        {
          startupId: 3,
          shares: 150,
          investmentAmount: "0.75",
          timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
          sharePrice: "0.005"
        }
      ];
      
      // Mock profit data
      const mockTotalProfits = "0.25";
      
      // Mock portfolio value
      const mockPortfolioValue = "2.5";
      
      // Mock performance data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const monthlyPerformance = months.map(() => Math.random() * 20 - 5); // Dummy data

      setData({
        investments: mockInvestments,
        totalInvested: "2.25",
        totalProfits: mockTotalProfits,
        activeInvestments: mockInvestments.length,
        portfolioValue: mockPortfolioValue,
        performanceMetrics: {
          monthly: monthlyPerformance,
          labels: months
        }
      });
    } catch (error) {
      console.error('Error fetching investor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && account) {
      fetchInvestorData();
    }
  }, [isConnected, account]);

  return {
    data,
    loading,
    refresh: fetchInvestorData
  };
};