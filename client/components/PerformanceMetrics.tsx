import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChartCard } from './BarChart';
import { useStartupMetrics } from '@/hooks/useStartupMetrics';
import { format } from 'date-fns';
import { formatEthToUsd, formatPercentage } from '@/lib/utils';

interface PerformanceMetricsProps {
  startupId: number;
}

export default function PerformanceMetrics({ startupId }: PerformanceMetricsProps) {
  const { metrics, loading, error } = useStartupMetrics(startupId);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">{error || 'No metrics available'}</p>
        </CardContent>
      </Card>
    );
  }

  const getLabels = (timestamps: number[]) => {
    return timestamps.map(ts => format(new Date(ts * 1000), 'MMM dd'));
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Financial Metrics</CardTitle>
          <CardDescription>Revenue and market performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Revenue</h4>
            <BarChartCard
              data={metrics.financial.revenue}
              labels={getLabels(metrics.financial.timestamp)}
              label="Revenue (ETH)"
              color="#2ecc71"
            />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Market Size</h4>
            <BarChartCard
              data={metrics.financial.marketSize}
              labels={getLabels(metrics.financial.timestamp)}
              label="Market Size (ETH)"
              color="#3498db"
            />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Monthly Burn Rate</h4>
            <BarChartCard
              data={metrics.financial.burnRate}
              labels={getLabels(metrics.financial.timestamp)}
              label="Burn Rate (ETH)"
              color="#e74c3c"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Growth Metrics</CardTitle>
          <CardDescription>User growth and engagement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">User Growth</h4>
            <BarChartCard
              data={metrics.financial.userGrowth}
              labels={getLabels(metrics.financial.timestamp)}
              label="New Users"
              color="#9b59b6"
            />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">User Retention</h4>
            <BarChartCard
              data={metrics.performance.retention}
              labels={getLabels(metrics.performance.timestamp)}
              label="Retention Rate %"
              color="#f1c40f"
            />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">User Engagement</h4>
            <BarChartCard
              data={metrics.performance.engagement}
              labels={getLabels(metrics.performance.timestamp)}
              label="Engagement Score"
              color="#1abc9c"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valuation History</CardTitle>
          <CardDescription>Historical startup valuations</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChartCard
            data={metrics.valuation.history}
            labels={getLabels(metrics.valuation.timestamp)}
            label="Valuation (ETH)"
            color="#34495e"
          />
        </CardContent>
      </Card>
    </div>
  );
}