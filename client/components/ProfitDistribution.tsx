"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useWeb3 } from '@/hooks/useWeb3'
import { toast } from 'sonner'
import { BarChart } from '@/components/BarChart'

interface ProfitData {
  totalProfits: number;
  distributedProfits: number;
  nextDistributionDate: Date;
  shareholderCount: number;
  performanceMetrics: {
    revenue: number[];
    growth: number[];
    userBase: number[];
    periods: string[];
  };
}

export default function ProfitDistribution({ startupId }: { startupId: number }) {
  const { web3Service } = useWeb3()
  const [profitData, setProfitData] = useState<ProfitData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfitData = async () => {
    if (!web3Service?.contracts.profitDistribution || !web3Service?.contracts.performanceOracle) {
      return
    }

    try {
      setLoading(true)
      
      // Fetch profit distribution data
      const profitInfo = await web3Service.contracts.profitDistribution.getStartupProfits(startupId)
      const nextDistribution = await web3Service.contracts.profitDistribution.getNextDistributionDate(startupId)
      const shareholders = await web3Service.contracts.profitDistribution.getShareholderCount(startupId)

      // Fetch performance metrics
      const metrics = await web3Service.contracts.performanceOracle.getStartupMetrics(startupId)
      
      // Process the data
      setProfitData({
        totalProfits: Number(profitInfo.totalProfits),
        distributedProfits: Number(profitInfo.distributedProfits),
        nextDistributionDate: new Date(Number(nextDistribution) * 1000),
        shareholderCount: Number(shareholders),
        performanceMetrics: {
          revenue: metrics.revenueData.map(Number),
          growth: metrics.growthData.map(Number),
          userBase: metrics.userBaseData.map(Number),
          periods: metrics.periods
        }
      })
    } catch (error) {
      console.error('Error fetching profit data:', error)
      toast.error('Failed to load profit distribution data')
    } finally {
      setLoading(false)
    }
  }

  const claimProfits = async () => {
    if (!web3Service?.contracts.profitDistribution) {
      toast.error('Profit distribution contract not initialized')
      return
    }

    try {
      setLoading(true)
      const tx = await web3Service.contracts.profitDistribution.claimProfits(startupId)
      await tx.wait()
      toast.success('Profits claimed successfully')
      fetchProfitData() // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim profits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfitData()
  }, [startupId, web3Service])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    )
  }

  if (!profitData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No profit data available</p>
        </CardContent>
      </Card>
    )
  }

  const distributionProgress = (profitData.distributedProfits / profitData.totalProfits) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profit Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Distribution Progress</span>
                <span className="text-sm font-medium">{distributionProgress.toFixed(1)}%</span>
              </div>
              <Progress value={distributionProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Profits</p>
                <p className="text-lg font-semibold">${profitData.totalProfits.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Distributed Profits</p>
                <p className="text-lg font-semibold">${profitData.distributedProfits.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Distribution</p>
                <p className="text-lg font-semibold">
                  {profitData.nextDistributionDate.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Shareholders</p>
                <p className="text-lg font-semibold">{profitData.shareholderCount}</p>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={claimProfits}
              disabled={loading}
            >
              Claim Available Profits
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Revenue Growth</h4>
              <BarChart 
                data={profitData.performanceMetrics.revenue}
                labels={profitData.performanceMetrics.periods}
                color="blue"
              />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">User Base Growth</h4>
              <BarChart 
                data={profitData.performanceMetrics.userBase}
                labels={profitData.performanceMetrics.periods}
                color="green"
              />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Growth Rate</h4>
              <BarChart 
                data={profitData.performanceMetrics.growth}
                labels={profitData.performanceMetrics.periods}
                color="purple"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}