"use client";
import { useState } from "react";
import {
  Layers,
  PieChart,
  BrainCircuit,
  Eye,
  Users,
  DollarSign,
} from "lucide-react";
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
        <div className="fixed top-0 left-0 h-full w-full z-0"></div>
        <div className="fixed inset-0 flex justify-center bg-black/20 z-20"></div>
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
          <div className="absolute top-0 left-0 h-full w-full -z-20">
            {/* <img
              src="/images/lefthand.png"
              className="h-1/3 w-auto absolute left-0 top-1/2 transform -translate-y-1/2"
              alt="left-hand"
            />
            <img
              src="/images/righthand.png"
              className="h-1/3 w-auto absolute right-0 top-1/2 transform -translate-y-1/2"
              alt="right-hand"
            /> */}
            <div className="absolute top-1/2 left-1/2 -translate-x-[51%] -translate-y-1/3 w-full h-full z-[15] scale-[0.7] opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
                <defs>
                  <filter
                    id="glow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite
                      in="SourceGraphic"
                      in2="blur"
                      operator="over"
                    />
                  </filter>
                </defs>

                <circle
                  cx="200"
                  cy="200"
                  r="100"
                  fill="none"
                  stroke="white"
                  stroke-width="1"
                  opacity="0"
                  filter="url(#glow)"
                >
                  <animate
                    attributeName="r"
                    from="100"
                    to="190"
                    dur="4s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.9;0"
                    dur="4s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>

                <circle
                  cx="200"
                  cy="200"
                  r="100"
                  fill="none"
                  stroke="white"
                  stroke-width="1"
                  opacity="0"
                  filter="url(#glow)"
                >
                  <animate
                    attributeName="r"
                    from="100"
                    to="190"
                    dur="4s"
                    begin="1s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.9;0"
                    dur="4s"
                    begin="1s"
                    repeatCount="indefinite"
                  />
                </circle>

                <circle
                  cx="200"
                  cy="200"
                  r="100"
                  fill="none"
                  stroke="white"
                  stroke-width="1"
                  opacity="0"
                  filter="url(#glow)"
                >
                  <animate
                    attributeName="r"
                    from="100"
                    to="190"
                    dur="4s"
                    begin="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.9;0"
                    dur="4s"
                    begin="2s"
                    repeatCount="indefinite"
                  />
                </circle>

                <circle
                  cx="200"
                  cy="200"
                  r="100"
                  fill="none"
                  stroke="white"
                  stroke-width="1"
                  opacity="0"
                  filter="url(#glow)"
                >
                  <animate
                    attributeName="r"
                    from="100"
                    to="190"
                    dur="4s"
                    begin="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.9;0"
                    dur="4s"
                    begin="3s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>
            <video
              className="absolute top-[40vh] left-[51vw] transform -translate-x-1/2 z-10 scale-100 sm:scale-[1.05] md:scale-[1.1] lg:scale-[1.15] xl:scale-[1.2] overflow-x-hidden"
              src="/videos/blackhole-blue.mp4"
              type="video/mp4"
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="fixed inset-0 flex justify-center bg-black/20 z-20"></div>
          </div>
          <div className="fixed inset-0 bg-black/20 pointer-events-none -z-20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_20%,_rgba(0,0,0,1)_100%)]"></div>
          </div>
          <span
            className="bg-clip-text text-transparent bg-gradient-to-b from-[#EAEAEA] via-[#DBDBDB] to-[#ADA996]
 font-regular text-5xl font-medium pb-5 relative -top-[20%]"
          >
            Democratizing Equity with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-t from-[#C39BD3]  to-[#7A00E6] font-regular text-5xl font-bold">
              ZeedChain
            </span>
          </span>
          <Button
            variant={"outline"}
            className="mt-5 bg-violet-200/10 hover:bg-violet-200/20 border border-violet-200/10 rounded-full text-[1rem] font-light p-5 relative -top-[20%]"
            onClick={() => router.push("/explore")}
          >
            <span className="flex items-center">
              <span>Start Investing</span>
              <span className="ml-2">
                <ChevronRight className="h-4 w-4" />
              </span>
            </span>
          </Button>
        </div>
        <div className="relative flex items-center flex-col w-full bg-gradient-to-b from-black/20 to-transparent pt-5 before:absolute before:top-0 before:left-0 before:w-full before:h-32 before:bg-gradient-to-b before:from-black/40 before:to-transparent">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#EAEAEA] via-[#DBDBDB] to-[#ADA996] font-regular text-5xl font-bold pb-5">
            Key Features
          </span>
          <div className="grid grid-cols-3 grid-rows-2 w-full px-20 pb-20 pt-5">
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
                icon: DollarSign,
              },
              {
                title: "Decentralized Fund Utilization",
                desc: "Ensure transparent use of invested capital through blockchain-based tracking.",
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
            ].map((card, index) => (
              <FancyCard
                key={index}
                title={card.title}
                desc={card.desc}
                icon={card.icon}
              />
            ))}
          </div>
        </div>
        <footer className="w-full bg-gradient-to-b from-black to-black border-t bg-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div>
                <div className="flex items-center">
                  <img src="/images/zeedchainlogo-white.png" alt="ZC" className="mr-2 w-4  h-5 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-4">ZeedChain</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Democratizing equity with ZeedChain
                </p>
                <div className="flex space-x-4">
                  <a
                    href="https://github.com/agnij-dutta/ZeedChain-live"
                    className="text-gray-400 hover:text-violet-400 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                      <path d="M9 18c-4.51 2-5-2-7-2"></path>
                    </svg>
                  </a>
                  <a
                    href="https://x.com/ZeedChain97811"
                    className="text-gray-400 hover:text-violet-400 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Company
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="/about"
                      className="text-gray-400 hover:text-violet-400 transition-colors"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="/careers"
                      className="text-gray-400 hover:text-violet-400 transition-colors"
                    >
                      Careers
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Resources
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="/docs"
                      className="text-gray-400 hover:text-violet-400 transition-colors"
                    >
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="/api"
                      className="text-gray-400 hover:text-violet-400 transition-colors"
                    >
                      API Reference
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className=" pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-500 mb-4 md:mb-0 flex items-center">
                <span>© 2025 ZeedChain. All rights reserved.</span>
              </div>
              <div className="flex space-x-6">
                <a
                  href="/privacy"
                  className="text-gray-400 hover:text-violet-400 text-sm transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="text-gray-400 hover:text-violet-400 text-sm transition-colors"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

const FancyCard = ({ title, desc, icon: Icon }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={`relative bg-gradient-to-t from-white/10 to-white/0 backdrop-blur-sm rounded-[0] p-5 border border-white/10 shadow-lg transition-all duration-300 p-10 ${
        isHovered
          ? "transform -translate-y-1 scale-[1.005] shadow-violet-500/20"
          : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
          <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-violet-500/50 to-transparent"></div>
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-violet-500/50 to-transparent"></div>
        </div>
      )}
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center">
          <span
            className={`mr-3 transition-all duration-300 ${
              isHovered ? "text-violet-400 scale-110" : "text-violet-500"
            }`}
          >
            <Icon size={24} />
          </span>
          <span
            className={`text-xl font-bold truncate transition-colors duration-300 ${
              isHovered ? "text-white" : "text-gray-100"
            }`}
          >
            {title}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <CardDescription className="text-gray-300">{desc}</CardDescription>
      </CardContent>
    </Card>
  );
};
