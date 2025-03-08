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
import { Analytics } from "@/components/Analytics";
import { Stats } from "@/components/Stats";
import History from "@/components/History";
import ProfileCard from "@/components/ProfileCard";
import { BarChartCard } from "@/components/BarChart";
import { FloatingNav } from "@/components/ui/floating-navbar";
import Taskbar from "@/components/Taskbar";
import { Calendar, Download, Search, Users, Package, ChevronDown, Activity, TrendingUp, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shared/card";
import { useWeb3 } from "@/hooks/useWeb3";
import { useInvestorData } from "@/hooks/useInvestorData";
import { Avatar } from "@/components/ui/avatar";
import { formatAddress } from "@/lib/utils";
import { format } from "date-fns";

const InvestorDashboard = () => {
  const { isConnected, account } = useWeb3();
  const { data, loading } = useInvestorData();

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
            <p className="text-gray-500 mb-4">Please connect your wallet to view your investor dashboard</p>
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
            Investor Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Invested"
            value={`$${(parseFloat(data.totalInvested) * 2000).toLocaleString()}`}
            change={`${data.activeInvestments} active investments`}
            icon={<span className="text-xl">$</span>}
          />
          <MetricCard
            title="Portfolio Value"
            value={`$${(parseFloat(data.portfolioValue) * 2000).toLocaleString()}`}
            change={`+${((parseFloat(data.portfolioValue) / parseFloat(data.totalInvested) - 1) * 100).toFixed(1)}% total return`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            title="Total Profits"
            value={`$${(parseFloat(data.totalProfits) * 2000).toLocaleString()}`}
            change="Ready to claim"
            icon={<Package className="h-5 w-5" />}
          />
          <MetricCard
            title="Performance"
            value={`${data.performanceMetrics.monthly[data.performanceMetrics.monthly.length - 1].toFixed(1)}%`}
            change="This month"
            icon={<Activity className="h-5 w-5" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Monthly returns</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <BarChartCard
                data={data.performanceMetrics.monthly}
                labels={data.performanceMetrics.labels}
                label="Return %"
                color="#136a8a"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-2">Recent Investments</h2>
              <p className="text-sm text-gray-400 mb-4">Your latest investment activity</p>
              <div className="space-y-4">
                {data.investments.slice(-5).map((investment, i) => (
                  <SaleItem
                    key={i}
                    address={account!}
                    amount={`${investment.investmentAmount} ETH`}
                    date={format(new Date(investment.timestamp * 1000), 'MMM dd, yyyy')}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
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

export default InvestorDashboard;
