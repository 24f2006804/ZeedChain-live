"use client"
import { useState } from "react"
import StartupCard, { type StartupData } from "@/components/ui/startupcard"
import CategoryFilter, { type Category } from "@/components/ui/category-filter"
import { useStartups } from "@/hooks/useStartups"
import { useWeb3 } from "@/hooks/useWeb3"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// Specified user address
const SPECIFIED_USER_ADDRESS = "0x6AE9b9f7f404E686a5e762B851394a4708971078";

export default function StartupExplorerPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All")
  const { startups, loading, error } = useStartups()
  const { isConnected, connectWallet, account } = useWeb3()

  // Filter startups based on selected category
  const filteredStartups = selectedCategory === "All" 
    ? startups 
    : startups.filter(startup => 
        startup.industry === selectedCategory || 
        (startup.industry === "FinTech" && selectedCategory === "Technology") ||
        (startup.industry === "HealthTech" && selectedCategory === "Wellness")
      )

  // Separate startups created by the specified user
  const userStartups = filteredStartups.filter(
    startup => startup.founder?.toLowerCase() === SPECIFIED_USER_ADDRESS.toLowerCase()
  );
  
  const otherStartups = filteredStartups.filter(
    startup => startup.founder?.toLowerCase() !== SPECIFIED_USER_ADDRESS.toLowerCase()
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen p-10 flex flex-col items-center justify-center bg-black text-violet-200">
        <h1 className="text-2xl font-bold mb-4 text-violet-300">Connect Wallet to View Startups</h1>
        <Button 
          onClick={connectWallet}
          className="bg-violet-800 hover:bg-violet-700 text-violet-100">
          Connect Wallet
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center bg-black">
        <div className="text-red-400">
          <h2 className="text-xl font-bold mb-2 text-red-300">Error Loading Startups</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const isSpecifiedUser = account?.toLowerCase() === SPECIFIED_USER_ADDRESS.toLowerCase();

  return (
    <div className="min-h-screen p-10 bg-black text-violet-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="mb-6 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-500 to-indigo-600 font-regular text-5xl font-bold">
          Explore
        </h1>
        
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        {userStartups.length > 0 && isSpecifiedUser && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-indigo-400">Your Startups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userStartups.map((startup) => (
                <StartupCard 
                  key={startup.id}
                  startup={startup} 
                  variant="bounty" 
                />
              ))}
            </div>
          </div>
        )}
        
        {filteredStartups.length === 0 ? (
          <div className="text-center text-violet-400 py-12">
            <p>No startups found in this category.</p>
          </div>
        ) : (
          <div>
            {userStartups.length > 0 && isSpecifiedUser && (
              <h2 className="text-2xl font-bold mb-4 text-violet-300">All Startups</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(isSpecifiedUser ? otherStartups : filteredStartups).map((startup) => (
                <StartupCard 
                  key={startup.id}
                  startup={startup} 
                  variant="bounty" 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}