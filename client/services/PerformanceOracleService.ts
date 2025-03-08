import { ethers } from 'ethers';
import { PerformanceMetricsOracle } from '../../../web3/typechain-types';

export class PerformanceOracleService {
  private oracle: PerformanceMetricsOracle;

  constructor(oracle: PerformanceMetricsOracle) {
    this.oracle = oracle;
  }

  async requestMetricsUpdate(startupId: number) {
    try {
      const tx = await this.oracle.requestStartupMetrics(startupId);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error requesting metrics update:', error);
      throw error;
    }
  }

  async getStartupMetrics(startupId: number) {
    try {
      const [
        growthRate,
        retentionRate,
        engagementScore,
        timestamp
      ] = await this.oracle.getLatestMetrics(startupId);

      return {
        growthRate: Number(growthRate) / 100, // Convert from basis points
        retentionRate: Number(retentionRate) / 100,
        engagementScore: Number(engagementScore) / 100,
        timestamp: Number(timestamp)
      };
    } catch (error) {
      console.error('Error fetching startup metrics:', error);
      throw error;
    }
  }

  async getHistoricalMetrics(startupId: number) {
    try {
      const history = await this.oracle.getHistoricalMetrics(startupId);
      return history.map(metric => ({
        growthRate: Number(metric.growthRate) / 100,
        retentionRate: Number(metric.retentionRate) / 100,
        engagementScore: Number(metric.engagementScore) / 100,
        timestamp: Number(metric.timestamp)
      }));
    } catch (error) {
      console.error('Error fetching historical metrics:', error);
      throw error;
    }
  }

  async getUpdateInterval() {
    try {
      const interval = await this.oracle.minUpdateInterval();
      return Number(interval);
    } catch (error) {
      console.error('Error fetching update interval:', error);
      throw error;
    }
  }

  async getLastUpdateTime(startupId: number) {
    try {
      const timestamp = await this.oracle.lastUpdateTime(startupId);
      return Number(timestamp);
    } catch (error) {
      console.error('Error fetching last update time:', error);
      throw error;
    }
  }

  onMetricsReceived(
    startupId: number,
    callback: (
      growthRate: number,
      retentionRate: number,
      engagementScore: number,
      timestamp: number
    ) => void
  ) {
    const filter = this.oracle.filters.MetricsReceived(startupId);
    this.oracle.on(filter, (id, growth, retention, engagement, time) => {
      if (id === startupId) {
        callback(
          Number(growth) / 100,
          Number(retention) / 100,
          Number(engagement) / 100,
          Number(time)
        );
      }
    });

    // Return cleanup function
    return () => {
      this.oracle.off(filter);
    };
  }

  onRequestFailed(
    callback: (requestId: string, reason: string) => void
  ) {
    const filter = this.oracle.filters.RequestFailed();
    this.oracle.on(filter, callback);

    // Return cleanup function
    return () => {
      this.oracle.off(filter);
    };
  }
}