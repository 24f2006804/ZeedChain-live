"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import {
  BookOpen, Users, Cpu, Leaf, PaintbrushIcon as PaintBrush,
  Heart, Briefcase, Star, Share2, MoreVertical, CheckCircle
} from "lucide-react"

const categoryIcons: Record<string, React.ReactNode> = {
  Education: <BookOpen className="h-4 w-4" />,
  Community: <Users className="h-4 w-4" />,
  Technology: <Cpu className="h-4 w-4" />,
  Environment: <Leaf className="h-4 w-4" />,
  "Arts & Culture": <PaintBrush className="h-4 w-4" />,
  Wellness: <Heart className="h-4 w-4" />,
  FinTech: <Briefcase className="h-4 w-4" />,
  HealthTech: <Heart className="h-4 w-4" />,
}

const industryToCategoryMap: Record<string, string> = {
  FinTech: "Technology",
  HealthTech: "Wellness",
  Blockchain: "Technology",
}

export type StartupData = {
  startup_name: string
  logo_url: string
  current_valuation: string
  funding_progress: number
  total_amount_being_raised: string
  minimum_investment: string
  available_equity_offered: string
  industry: string
  university_affiliation: string
  description?: string
  days_left?: number
  banner_url?: string
  verified?: boolean
}

interface StartupCardProps {
  startup: StartupData
  variant?: "default" | "project" | "bounty"
}

const StartupCard = ({ startup, variant = "bounty" }: StartupCardProps) => {
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(false)

  const handleClick = () => {
    router.push(`/explore/${startup.startup_name}`)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorited(!isFavorited)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Share", startup.startup_name)
  }

  const category = industryToCategoryMap[startup.industry] || startup.industry
  const CategoryIcon = categoryIcons[category] || <Briefcase className="h-4 w-4" />
  const raisedAmount = ((startup.funding_progress / 100) * Number.parseInt(startup.total_amount_being_raised.replace(/\D/g, ""))) / 1000

  if (variant === "bounty") {
    return (
      <Card className="w-full overflow-hidden bg-[#0B0B13] border-[#1E1E2A] hover:border-[#2A2A3A] transition-all duration-200">
        {startup.banner_url && (
          <div className="w-full h-32 bg-gradient-to-r from-[#3D2A2A] to-[#7A3E3E]" 
               style={{ backgroundImage: `url(${startup.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <div className="flex justify-end p-2 space-x-1">
              <button className="bg-[#2A2A2A]/80 hover:bg-[#3A3A3A]/80 rounded-full p-2 transition-colors">
                <Share2 className="h-4 w-4 text-gray-400" />
              </button>
              <button className="bg-[#2A2A2A]/80 hover:bg-[#3A3A3A]/80 rounded-full p-2 transition-colors">
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}

        <div className="flex px-4 -mt-6 relative z-10">
          <div className="bg-[#0B0B13] rounded-full p-1 border-2 border-[#1E1E2A]">
            <img src={startup.logo_url || "/placeholder.svg?height=60&width=60"}
                 alt={`${startup.startup_name} logo`}
                 className="w-12 h-12 rounded-full object-cover" />
          </div>
        </div>

        <CardHeader className="pt-2 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-lg font-bold text-white">{startup.startup_name}</h3>
              {startup.verified && <CheckCircle className="h-4 w-4 text-blue-400 ml-1" />}
            </div>
            <div className="flex space-x-1">
              <button onClick={handleFavorite}
                      className="bg-[#1A1A25] hover:bg-[#2A2A35] rounded-full p-2 transition-colors">
                <Star className={`h-4 w-4 ${isFavorited ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`} />
              </button>
              <button onClick={handleShare}
                      className="bg-[#1A1A25] hover:bg-[#2A2A35] rounded-full p-2 transition-colors">
                <Share2 className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {startup.description || `An innovative ${startup.industry} startup affiliated with ${startup.university_affiliation}.`}
          </p>
        </CardHeader>

        <CardContent className="pt-3">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-[#1A1A25] text-xs border-[#2A2A35] text-gray-300 flex items-center gap-1">
              {CategoryIcon}
              {startup.industry}
            </Badge>
            <Badge variant="outline" className="bg-[#1A1A25] text-xs border-[#2A2A35] text-gray-300">
              {startup.university_affiliation}
            </Badge>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Funding Progress</span>
              <span className="text-gray-300">{startup.funding_progress}%</span>
            </div>
            <Progress value={startup.funding_progress} className="h-2 bg-[#1A1A25]" />
            <div className="flex justify-between text-xs mt-1 text-gray-400">
              <span>${raisedAmount}K raised</span>
              <span>{startup.total_amount_being_raised} goal</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-[#1E1E2A] pt-3 mb-3">
            <div>
              <p className="text-xs text-gray-500">Min Investment</p>
              <p className="font-medium text-sm text-gray-300">{startup.minimum_investment}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Equity Offered</p>
              <p className="font-medium text-sm text-gray-300">{startup.available_equity_offered}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Days Left</p>
              <p className="font-medium text-sm text-gray-300">{startup.days_left || 15}</p>
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-[#267871] to-[#136a8a] transition duration-300 hover:from-[#1b5d5a] hover:to-[#0f566e]
 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  onClick={handleClick}>
            Support This Startup
          </button>
        </CardContent>
      </Card>
    )
  }

  // Project variant
  if (variant === "project") {
    return (
      <Card className="w-full bg-black text-white border-gray-800 hover:border-gray-700 transition-all duration-200">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <h3 className="text-xl font-bold">{startup.startup_name}</h3>
            <div className="text-yellow-500 mt-1">{startup.industry}</div>
          </div>
          <div className="text-primary">{CategoryIcon}</div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">
            {startup.description || `An innovative ${startup.industry} startup affiliated with ${startup.university_affiliation}.`}
          </p>
          <Progress value={startup.funding_progress} className="h-2 mb-2" />
          <div className="flex justify-between text-sm mb-4">
            <div>${raisedAmount}K raised</div>
            <div>{startup.total_amount_being_raised} goal</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-gray-400">{startup.days_left || 15} days left</div>
            <button className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
                    onClick={handleClick}>
              Support This Project
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className="w-full bg-[#0B0B13] text-white border-[#1E1E2A] hover:border-[#2A2A3A] transition-all duration-200 cursor-pointer"
          onClick={handleClick}>
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        <img src={startup.logo_url || "/placeholder.svg?height=40&width=40"}
             alt={`${startup.startup_name} logo`}
             className="w-10 h-10 rounded-full object-cover" />
        <div>
          <h3 className="text-xl font-bold">{startup.startup_name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline" className="bg-[#1A1A25] border-[#2A2A35] text-gray-300 flex items-center gap-1">
              {CategoryIcon}
              {startup.industry}
            </Badge>
            <Badge variant="outline" className="bg-[#1A1A25] border-[#2A2A35] text-gray-300">
              {startup.university_affiliation}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-400">Current Valuation</p>
            <p className="font-semibold text-gray-300">{startup.current_valuation}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Raising</p>
            <p className="font-semibold text-gray-300">{startup.total_amount_being_raised}</p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Funding Progress</p>
          <Progress value={startup.funding_progress} className="h-2 bg-[#1A1A25]" />
          <p className="text-sm text-gray-400 mt-1 text-right">{startup.funding_progress}% Funded</p>
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-[#1E1E2A] pt-4">
          <div>
            <p className="text-xs text-gray-400">Min Investment</p>
            <p className="font-medium text-sm text-gray-300">{startup.minimum_investment}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Equity Offered</p>
            <p className="font-medium text-sm text-gray-300">{startup.available_equity_offered}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Days Left</p>
            <p className="font-medium text-sm text-gray-300">{startup.days_left || 15}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StartupCard