"use client";
import React from "react";
import {
  IconBrandGithub,
  IconBrandX,
  IconExchange,
  IconHome,
  IconNewSection,
  IconTerminal2,
  IconSettings,
  IconCoins,
  IconUser,
  IconList,
} from "@tabler/icons-react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { Calendar, Download, Search, Users, Package, ChevronDown, Activity, TrendingUp, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/card";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import Taskbar from "@/components/Taskbar";
import { useWeb3 } from "@/hooks/useWeb3";
import { useFounderData } from "@/hooks/useFounderData";
import { Avatar } from "@/components/ui/avatar";
import { formatAddress } from "@/lib/utils";
import { format } from "date-fns";
import { BarChartCard } from "@/components/BarChart";

const FounderDashboard = () => {
  const { isConnected, account } = useWeb3();
  const { data, loading } = useFounderData();

  const links = [
    {
      title: "Founder",
      icon: <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/founder",
    },
    {
      title: "Investor",
      icon: <IconCoins className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/investor",
    },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
            <p className="text-gray-500 mb-4">Please connect your wallet to view your founder dashboard</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <main className="container mx-auto p-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-[#EAEAEA] via-[#DBDBDB] to-[#ADA996] font-regular text-5xl font-bold">
            Founder Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Investments"
            value={`$${(parseFloat(data.totalInvestments) * 2000).toLocaleString()}`}
            change={`${data.startups.length} startups`}
            icon={<span className="text-xl">$</span>}
          />
          <MetricCard
            title="Total Valuation"
            value={`$${(parseFloat(data.totalValuation) * 2000).toLocaleString()}`}
            change={`${data.totalInvestors} total investors`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            title="Average Growth"
            value={`${data.performanceMetrics.growth[data.performanceMetrics.growth.length - 1].toFixed(1)}%`}
            change="This month"
            icon={<Package className="h-5 w-5" />}
          />
          <MetricCard
            title="User Base"
            value={data.performanceMetrics.userBase[data.performanceMetrics.userBase.length - 1].toLocaleString()}
            change="+12% from last month"
            icon={<Users className="h-5 w-5" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Monthly overview</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Revenue Growth</h4>
                  <BarChartCard
                    data={data.performanceMetrics.revenue}
                    labels={data.performanceMetrics.periods}
                    label="Revenue $"
                    color="#136a8a"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">User Growth</h4>
                  <BarChartCard
                    data={data.performanceMetrics.userBase}
                    labels={data.performanceMetrics.periods}
                    label="Users"
                    color="#2ecc71"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-2">Recent Investments</h2>
              <p className="text-sm text-gray-400 mb-4">Latest investor activities</p>
              <div className="space-y-4">
                {data.recentInvestments.map((investment, i) => (
                  <SaleItem
                    key={i}
                    address={investment.investor}
                    amount={`${investment.amount} ETH`}
                    date={format(new Date(investment.timestamp * 1000), 'MMM dd, yyyy')}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-5">
          <CardHeader>
            <CardTitle className="text-base">Your Startups</CardTitle>
            <CardDescription>Overview of all your registered startups</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {data.startups.map((startup) => (
                <div key={startup.id} className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <div>
                    <h3 className="font-medium">{startup.name}</h3>
                    <div className="flex gap-4 mt-1">
                      <p className="text-sm text-gray-400">Valuation: ${(parseFloat(startup.currentValuation) * 2000).toLocaleString()}</p>
                      <p className="text-sm text-gray-400">Investors: {startup.investors}</p>
                      <p className="text-sm text-gray-400">
                        Shares: {((startup.totalShares - startup.availableShares) / startup.totalShares * 100).toFixed(1)}% sold
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${startup.isValidated ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                      {startup.isValidated ? 'Validated' : 'Pending'}
                    </span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Taskbar>
        <FloatingDock items={links} desktopClassName="" />
      </Taskbar>
    </div>
  );
};

function MetricCard({ title, value, change, icon }) {
  return (
    <Card className="border">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            <p className="text-xs text-[#136a8a] mt-1">{change}</p>
          </div>
          <div className="text-gray-400">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function SaleItem({ address, amount, date }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border">
          <span className="text-xs">{address.charAt(2)}</span>
        </Avatar>
        <div>
          <p className="font-medium">{formatAddress(address)}</p>
          <p className="text-sm text-gray-400">{date}</p>
        </div>
      </div>
      <span className="text-[#136a8a] font-medium">{amount}</span>
    </div>
  );
}

export default FounderDashboard;