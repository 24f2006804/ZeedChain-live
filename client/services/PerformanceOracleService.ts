import { ethers } from 'ethers';
import { PerformanceMetricsOracle } from '../../web3/typechain-types/contracts/PerformanceMetricsOracle';

export class PerformanceOracleService {
  private oracle: PerformanceMetricsOracle;

  constructor(oracle: PerformanceMetricsOracle) {
    this.oracle = oracle;
  }

  async requestMetricsUpdate(startupId: number) {
    try {
      const tx = await this.oracle.requestPerformanceMetrics(startupId, "defaultSource");
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error requesting metrics update:', error);
      throw error;
    }
  }

  async getStartupMetrics(startupId: number) {
    try {
      const metrics = await this.oracle.getLatestMetrics(startupId);

      return {
        activeUsers: Number(metrics.activeUsers),
        monthlyRevenue: Number(metrics.monthlyRevenue) / 1e18, // Convert from wei
        customerGrowth: Number(metrics.customerGrowth) / 100, // Convert from basis points
        retentionRate: Number(metrics.retentionRate) / 100, // Convert from basis points
        unitEconomics: Number(metrics.unitEconomics) / 1e18, // Convert from wei
        timestamp: Number(metrics.timestamp),
        isValidated: metrics.isValidated
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
        activeUsers: Number(metric.activeUsers),
        monthlyRevenue: Number(metric.monthlyRevenue) / 1e18,
        customerGrowth: Number(metric.customerGrowth) / 100,
        retentionRate: Number(metric.retentionRate) / 100,
        unitEconomics: Number(metric.unitEconomics) / 1e18,
        timestamp: Number(metric.timestamp),
        isValidated: metric.isValidated
      }));
    } catch (error) {
      console.error('Error fetching historical metrics:', error);
      throw error;
    }
  }

  async getUpdateInterval() {
    try {
      const interval = await this.oracle.MIN_UPDATE_INTERVAL();
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
      activeUsers: number,
      monthlyRevenue: number,
      customerGrowth: number,
      retentionRate: number,
      unitEconomics: number
    ) => void
  ) {
    const filter = this.oracle.filters.MetricsReceived(BigInt(startupId));
    this.oracle.on(filter, (id, active, revenue, growth, retention, unit) => {
      if (id === BigInt(startupId)) {
        callback(
          Number(active),
          Number(revenue) / 1e18,
          Number(growth) / 100,
          Number(retention) / 100,
          Number(unit) / 1e18
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