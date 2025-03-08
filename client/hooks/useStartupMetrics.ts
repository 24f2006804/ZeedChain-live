import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { ethers } from 'ethers';

export interface StartupMetrics {
  financial: {
    revenue: number[];
    burnRate: number[];
    marketSize: number[];
    userGrowth: number[];
    timestamp: number[];
  };
  performance: {
    growth: number[];
    retention: number[];
    engagement: number[];
    timestamp: number[];
  };
  valuation: {
    history: number[];
    timestamp: number[];
  };
}

export const useStartupMetrics = (startupId: number) => {
  const { web3Service } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<StartupMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    if (!web3Service?.contracts.financialOracle || !web3Service?.contracts.performanceOracle || !web3Service?.contracts.factory || !startupId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // For now, let's use mock data since we're having issues with the contract calls
      // In a production environment, we would properly implement these calls
      
      // Mock financial metrics
      const mockFinancialData = {
        revenue: [10000, 15000, 20000, 25000, 30000, 35000],
        burnRate: [5000, 6000, 7000, 8000, 9000, 10000],
        marketSize: [100000, 120000, 140000, 160000, 180000, 200000],
        userGrowth: [100, 200, 300, 400, 500, 600],
        timestamp: [
          Date.now() - 5 * 30 * 24 * 60 * 60 * 1000,
          Date.now() - 4 * 30 * 24 * 60 * 60 * 1000,
          Date.now() - 3 * 30 * 24 * 60 * 60 * 1000,
          Date.now() - 2 * 30 * 24 * 60 * 60 * 1000,
          Date.now() - 1 * 30 * 24 * 60 * 60 * 1000,
          Date.now()
        ]
      };
      
      // Mock performance metrics
      const mockPerformanceData = {
        growth: [5, 10, 15, 20, 25, 30],
        retention: [90, 85, 80, 85, 90, 95],
        engagement: [60, 65, 70, 75, 80, 85],
        timestamp: [
          Date.now() - 5 * 30 * 24 * 60 * 60 * 1000,
          Date.now() - 4 * 30 * 24 * 60 * 60 * 1000,
          Date.now() - 3 * 30 * 24 * 60 * 60 * 1000,
          Date.now() - 2 * 30 * 24 * 60 * 60 * 1000,
          Date.now() - 1 * 30 * 24 * 60 * 60 * 1000,
          Date.now()
        ]
      };
      
      // Mock valuation history
      const mockValuationData = {
        history: [500000, 600000, 700000, 800000, 900000, 1000000],
        timestamp: [
          Date.now() - 5 * 30 * 24 * 60 * 60 * 1000,
          Date.now() - 4 * 30 * 24 * 60 * 60 * 1000,
          Date.now() - 3 * 30 * 24 * 60 * 60 * 1000,
          Date.now() - 2 * 30 * 24 * 60 * 60 * 1000,
          Date.now() - 1 * 30 * 24 * 60 * 60 * 1000,
          Date.now()
        ]
      };

      setMetrics({
        financial: mockFinancialData,
        performance: mockPerformanceData,
        valuation: mockValuationData
      });
    } catch (err) {
      console.error('Error fetching startup metrics:', err);
      setError('Failed to fetch startup metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [startupId, web3Service?.contracts]);

  return {
    metrics,
    loading,
    error,
    refresh: fetchMetrics
  };
};