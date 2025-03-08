"use client"

import { useState } from "react"
import StartupCard, { type StartupData } from "@/components/ui/startupcard"
import CategoryFilter, { type Category } from "@/components/ui/category-filter"

export default function StartupExplorerPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All")

  const sampleStartups: StartupData[] = [
    {
      startup_name: "CryptoEdu",
      logo_url: "https://avatar.iran.liara.run/public",
      current_valuation: "$2.5M",
      funding_progress: 65,
      total_amount_being_raised: "$500K",
      minimum_investment: "$1K",
      available_equity_offered: "8%",
      industry: "FinTech",
      university_affiliation: "Stanford",
      description: "Revolutionizing blockchain education with interactive learning tools and certification programs.",
      days_left: 12,
      verified: true,
      banner_url: "https://avatar.iran.liara.run/public"
    },
    {
      startup_name: "CryptoEdu",
      logo_url: "https://avatar.iran.liara.run/public",
      current_valuation: "$2.5M",
      funding_progress: 65,
      total_amount_being_raised: "$500K",
      minimum_investment: "$1K",
      available_equity_offered: "8%",
      industry: "FinTech",
      university_affiliation: "Stanford",
      description: "Revolutionizing blockchain education with interactive learning tools and certification programs.",
      days_left: 12,
      verified: true,
      banner_url: "https://avatar.iran.liara.run/public"
    },
    {
      startup_name: "CryptoEdu",
      logo_url: "https://avatar.iran.liara.run/public",
      current_valuation: "$2.5M",
      funding_progress: 65,
      total_amount_being_raised: "$500K",
      minimum_investment: "$1K",
      available_equity_offered: "8%",
      industry: "FinTech",
      university_affiliation: "Stanford",
      description: "Revolutionizing blockchain education with interactive learning tools and certification programs.",
      days_left: 12,
      verified: true,
      banner_url: "https://avatar.iran.liara.run/public"
    },
    {
      startup_name: "CryptoEdu",
      logo_url: "https://avatar.iran.liara.run/public",
      current_valuation: "$2.5M",
      funding_progress: 65,
      total_amount_being_raised: "$500K",
      minimum_investment: "$1K",
      available_equity_offered: "8%",
      industry: "FinTech",
      university_affiliation: "Stanford",
      description: "Revolutionizing blockchain education with interactive learning tools and certification programs.",
      days_left: 12,
      verified: true,
      banner_url: "https://via.placeholder.com/500x200"
    },
    {
      startup_name: "CryptoEdu",
      logo_url: "https://avatar.iran.liara.run/public",
      current_valuation: "$2.5M",
      funding_progress: 65,
      total_amount_being_raised: "$500K",
      minimum_investment: "$1K",
      available_equity_offered: "8%",
      industry: "FinTech",
      university_affiliation: "Stanford",
      description: "Revolutionizing blockchain education with interactive learning tools and certification programs.",
      days_left: 12,
      verified: true,
      banner_url: "https://via.placeholder.com/500x200"
    },
    {
      startup_name: "CryptoEdu",
      logo_url: "https://avatar.iran.liara.run/public",
      current_valuation: "$2.5M",
      funding_progress: 65,
      total_amount_being_raised: "$500K",
      minimum_investment: "$1K",
      available_equity_offered: "8%",
      industry: "FinTech",
      university_affiliation: "Stanford",
      description: "Revolutionizing blockchain education with interactive learning tools and certification programs.",
      days_left: 12,
      verified: true,
      banner_url: "https://via.placeholder.com/500x200"
    }
  ]

  // Filter startups based on selected category
  const filteredStartups = selectedCategory === "All" 
    ? sampleStartups 
    : sampleStartups.filter(startup => 
        startup.industry === selectedCategory || 
        (startup.industry === "FinTech" && selectedCategory === "Technology") ||
        (startup.industry === "HealthTech" && selectedCategory === "Wellness")
      )

  return (
    <div className="min-h-screen  p-10">
      <div className="max-w-7xl mx-auto">
      <h1 className="bg-clip-text mb-6 text-transparent bg-gradient-to-r from-[#EAEAEA] via-[#DBDBDB] to-[#ADA996] font-regular text-5xl font-bold">Explore</h1>
        
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        {filteredStartups.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p>No startups found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStartups.map((startup, index) => (
              <StartupCard 
                key={index}
                startup={startup} 
                variant="bounty" 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}