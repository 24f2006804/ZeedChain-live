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

import { useState } from "react"
import { Calendar, Download, Search, Users, Package, ChevronDown, Activity, TrendingUp,Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shared/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 203 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig
const InvestorDashboard = () => {

  const links = [
    {
      title: "Founder",
      icon: (
        <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/founder",
    },

    {
      title: "Investor",
      icon: (
        <IconCoins className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/investor",
    },
  ];
  return (
    <div className="min-h-screen text-white">
      <main className="container mx-auto p-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-[#EAEAEA] via-[#DBDBDB] to-[#ADA996] font-regular text-5xl font-bold">Investor Dashboard</h1>
          <div className="flex items-center gap-4">

          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Revenue Generated"
            value="$45,231.89"
            change="+20.1% from last month"
            icon={<span className="text-xl">$</span>}
          />
          <MetricCard
            title="Investors"
            value="30"
            change="+180.1% from last month"
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            title="Sales"
            value="+12,234"
            change="+19% from last month"
            icon={<Package className="h-5 w-5" />}
          />
          <MetricCard
            title="Active Now"
            value="+573"
            change="+201 since last hour"
            icon={<Activity className="h-5 w-5" />}
          />
        </div>

        <Analytics />
        <Card className="border mt-5">
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-2">Recent Investors</h2>
              <p className="text-sm text-gray-400 mb-4">This month {3} new investors joined you </p>
              <div className="space-y-4">
                <SaleItem name="" email="0x56XbHMmzUnjMo3QzB1TfN7tCuDsYXsik8wyu8NxhJ3Dv" amount="100 ETH" />
                <SaleItem name="" email="0x56XbHMmzUnjMo3QzB1TfN7tCuDsYXsik8wyu8NxhJ3Dv" amount="100 ETH" />
                <SaleItem name="" email="isabella.nguyen@email.com" amount="100 ETH" />
                <SaleItem name="" email="will@email.com" amount="100 ETH" />
                <SaleItem name="" email="sofia.davis@email.com" amount="100 ETH" />
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
    <Card className="border ">
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
  )
}

function SaleItem({ name, email, amount }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border">
          <span className="text-xs">{name.charAt(0)}</span>
        </Avatar>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-gray-400">{email}</p>
        </div>
      </div>
      <span className="text-[#136a8a] font-medium">{amount}</span>
    </div>
  )
}

function RevenueChart() {
  // This is a simplified chart component
  // In a real application, you would use a library like recharts or chart.js
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const values = [4500, 6000, 3500, 3000, 2800, 2500, 2500, 4000, 2000, 5500, 3000, 5000]
  const maxValue = Math.max(...values)

  return (
    <div className="flex h-full items-end gap-2">
      {months.map((month, index) => (
        <div key={month} className="flex flex-col items-center flex-1">
          <div
            className="w-full bg-white"
            style={{
              height: `${(values[index] / maxValue) * 100}%`,
              maxHeight: "90%",
            }}
          ></div>
          <span className="text-xs text-gray-400 mt-2">{month}</span>
        </div>
      ))}
    </div>
  )
}
export default InvestorDashboard;
