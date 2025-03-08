"use client";

import WalletConnect from "@/components/WalletConnect";
import NFTInvestment from "@/components/NFTInvestment";
import GovernanceInterface from "@/components/GovernanceInterface";
import ProfitDistribution from "@/components/ProfitDistribution";
import { useState } from "react";
import { Layers, PieChart, BrainCircuit, Eye, Users, DollarSign } from "lucide-react";
import { Playfair_Display } from "next/font/google";
import VantaBackground from "@/components/NetBackground";
import NoiseFilter from "@/components/filters/NoiseFilter";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  return (
    <>
      <div className="absolute top-0 left-0 h-screen w-screen">
        <NoiseFilter />
        <div className="fixed top-0 left-0 h-full w-full z-0">
          <VantaBackground />
        </div>
        <div className="fixed inset-0 flex justify-center bg-black/40 z-20"></div>
        <div
          className="fixed inset-0 mix-blend-overlay z-30"
          style={{
            background: "#000",
            filter: "url(#noiseFilter)",
          }}
        ></div>
      </div>
      <div className="absolute z-50 h-full w-full top-0">
        <div className="hero flex items-center justify-center h-full w-full relative flex-col">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#EAEAEA] via-[#DBDBDB] to-[#ADA996] font-regular text-5xl font-bold pb-5">
          Discover. Invest. Transform.
          </span>
          <span className={`${playfair.className} text-[1.8rem]`}>
            with ZeedChain
          </span>
          <Button 
            variant={"outline"} 
            className="mt-5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-[1rem] font-light p-5"
            onClick={() => router.push('/explore')}
          >
            <span className="flex items-center">
              <span>Start Investing</span>
              <span className="ml-2">
                <ChevronRight className="h-4 w-4" />
              </span>
            </span>
          </Button>
        </div>
        <div className="about flex items-center flex-col w-full">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#EAEAEA] via-[#DBDBDB] to-[#ADA996] font-regular text-5xl font-bold pb-5">
            Key Features
          </span>
          <div className="grid grid-cols-3 grid-rows-2 w-full px-20 pb-20 gap-5 pt-5">
            {[
              {
                title: "Tokenized Equity",
                desc: "Convert assets into blockchain-based tokens for secure and flexible ownership.",
                icon: Layers,
              },
              {
                title: "Fractional Investment",
                desc: "Invest in high-value assets with small capital through fractional ownership.",
                icon: PieChart,
              },
              {
                title: "Distributed Profits",
                desc: "Ensure fair and automated profit distribution among stakeholders.",
                icon: DollarSign
              },
              {
                title: "Belfort AI Advisor",
                desc: "AI-driven insights to optimize investment decisions and risk assessment.",
                icon: BrainCircuit,
              },
              {
                title: "Transparent Funds",
                desc: "Track fund allocation in real-time with verifiable blockchain records.",
                icon: Eye,
              },
              {
                title: "Decentralized Control",
                desc: "Enable community-driven decision-making with blockchain voting systems.",
                icon: Users,
              },
            ].map(({ title, desc, icon: Icon }, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-5 shadow-md border border-white/20">
                <CardHeader>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-500 dark:text-gray-400">
                    <Icon className="text-blue-300" />
                    </span>
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate ">
                      {title}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
