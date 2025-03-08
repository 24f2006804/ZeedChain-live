import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { ethers } from 'ethers';

export interface FinancialData {
  revenue: string;
  userGrowth: number;
  marketSize: string;
  burnRate: string;
  timestamp: number;
  history: {
    revenue: string[];
    userGrowth: number[];
    marketSize: string[];
    burnRate: string[];
    timestamps: number[];
  };
}

export const useFinancialData = (startupId: number) => {
  const { web3Service } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FinancialData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialData = async () => {
    if (!web3Service?.contracts.financialOracle || !startupId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get latest metrics
      const [revenue, userGrowth, marketSize, burnRate, timestamp] = 
        await web3Service.contracts.financialOracle.getLatestMetrics(startupId);

      // Get historical data
      const history = await web3Service.contracts.financialOracle.getHistoricalMetrics(startupId);
      
      const historicalData = {
        revenue: [],
        userGrowth: [],
        marketSize: [],
        burnRate: [],
        timestamps: []
      };

      history.forEach((metric: any) => {
        historicalData.revenue.push(ethers.formatEther(metric.revenue));
        historicalData.userGrowth.push(Number(metric.userGrowth));
        historicalData.marketSize.push(ethers.formatEther(metric.marketSize));
        historicalData.burnRate.push(ethers.formatEther(metric.burnRate));
        historicalData.timestamps.push(Number(metric.timestamp));
      });

      setData({
        revenue: ethers.formatEther(revenue),
        userGrowth: Number(userGrowth),
        marketSize: ethers.formatEther(marketSize),
        burnRate: ethers.formatEther(burnRate),
        timestamp: Number(timestamp),
        history: historicalData
      });
    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError('Failed to fetch financial data');
    } finally {
      setLoading(false);
    }
  };

  const requestUpdate = async () => {
    if (!web3Service?.contracts.financialOracle || !startupId) {
      throw new Error('Financial oracle not initialized');
    }

    try {
      const tx = await web3Service.contracts.financialOracle.requestFinancialMetrics(startupId);
      await tx.wait();
      
      // Set up event listener for metrics received
      const filter = web3Service.contracts.financialOracle.filters.MetricsReceived(startupId);
      web3Service.contracts.financialOracle.once(filter, () => {
        fetchFinancialData();
      });
    } catch (err) {
      console.error('Error requesting financial update:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [startupId, web3Service?.contracts]);

  return {
    data,
    loading,
    error,
    refresh: fetchFinancialData,
    requestUpdate
  };
};