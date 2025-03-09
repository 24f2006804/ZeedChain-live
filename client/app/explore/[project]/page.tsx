"use client"

import { useEffect, useState } from 'react'
import { useWeb3 } from '@/hooks/useWeb3'
import { useStartups } from '@/hooks/useStartups'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { StartupData } from '@/components/ui/startupcard'
import { CheckCircle, Share2, Building2, Users2, TrendingUp, CircleDollarSign } from 'lucide-react'
import PerformanceMetrics from '@/components/PerformanceMetrics'

export default function StartupDetails({ params }: { params: { project: string } }) {
  const { web3Service, isConnected, connectWallet } = useWeb3()
  const { startups, invest } = useStartups()
  const [startup, setStartup] = useState<StartupData | null>(null)
  const [isInvestDialogOpen, setIsInvestDialogOpen] = useState(false)
  const [investmentAmount, setInvestmentAmount] = useState("")

  useEffect(() => {
    if (startups.length > 0) {
      const foundStartup = startups.find(s => 
        s.startup_name.toLowerCase() === decodeURIComponent(params.project).toLowerCase()
      )
      if (foundStartup) {
        setStartup(foundStartup)
      }
    }
  }, [startups, params.project])

  const handleInvest = async () => {
    if (!startup) return

    try {
      const amountInEth = (parseFloat(investmentAmount) / 2000).toString() // Assuming 1 ETH = $2000
      await invest(startup.id!, amountInEth)
      toast.success('Investment successful!')
      setIsInvestDialogOpen(false)
      setInvestmentAmount("")
    } catch (error: any) {
      toast.error(error.message || 'Investment failed')
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen p-10 flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-2xl font-bold mb-4 text-violet-300">Connect Wallet to View Startup Details</h1>
        <Button onClick={connectWallet} className="bg-violet-900 hover:bg-violet-800 text-white">Connect Wallet</Button>
      </div>
    )
  }

  if (!startup) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center bg-black text-white">
        <div className="text-xl text-violet-300">Loading startup details...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-black text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={startup.logo_url}
              alt={startup.startup_name}
              className="w-20 h-20 rounded-full border-2 border-violet-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-bold text-white">{startup.startup_name}</h1>
                {startup.verified && <CheckCircle className="text-violet-400 h-6 w-6" />}
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="bg-transparent border-violet-700 text-violet-300">{startup.industry}</Badge>
                <Badge variant="outline" className="bg-transparent border-indigo-700 text-indigo-300">{startup.university_affiliation}</Badge>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsInvestDialogOpen(true)}
            className="bg-gradient-to-r from-violet-900 to-indigo-900 hover:from-violet-800 hover:to-indigo-800 text-white"
          >
            Invest Now
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="col-span-2 space-y-6">
            <Card className="bg-black border border-violet-900 shadow-md shadow-violet-900/20">
              <CardHeader>
                <CardTitle className="text-violet-300">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{startup.description}</p>
              </CardContent>
            </Card>

            <Card className="bg-black border border-indigo-900 shadow-md shadow-indigo-900/20">
              <CardHeader>
                <CardTitle className="text-indigo-300">Funding Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={startup.funding_progress} className="h-2 mb-2 bg-gray-800">
                  <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"></div>
                </Progress>
                <div className="flex justify-between text-sm text-gray-400">
                  <span className="text-violet-400">${((startup.funding_progress / 100) * parseInt(startup.total_amount_being_raised.replace(/\D/g, ''))) / 1000}K raised</span>
                  <span className="text-indigo-400">{startup.total_amount_being_raised} goal</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Investment Details */}
          <div className="space-y-6">
            <Card className="bg-black border border-blue-900 shadow-md shadow-blue-900/20">
              <CardHeader>
                <CardTitle className="text-blue-300">Investment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-gray-400">
                  <CircleDollarSign className="text-violet-500" />
                  <div>
                    <div className="font-medium text-violet-300">{startup.current_valuation}</div>
                    <div className="text-sm">Current Valuation</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Users2 className="text-blue-500" />
                  <div>
                    <div className="font-medium text-blue-300">{startup.available_equity_offered}</div>
                    <div className="text-sm">Available Equity</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Building2 className="text-indigo-500" />
                  <div>
                    <div className="font-medium text-indigo-300">{startup.minimum_investment}</div>
                    <div className="text-sm">Minimum Investment</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <TrendingUp className="text-violet-500" />
                  <div>
                    <div className="font-medium text-violet-300">{startup.days_left} Days</div>
                    <div className="text-sm">Time Left</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <PerformanceMetrics 
            startupId={startup?.id || 1}
          />
        </div>
      </div>

      <Dialog open={isInvestDialogOpen} onOpenChange={setIsInvestDialogOpen}>
        <DialogContent className="bg-black border border-violet-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-violet-300">Invest in {startup.startup_name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the amount you want to invest in USD. Minimum investment: {startup.minimum_investment}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="Investment amount in USD"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                min={parseFloat(startup.minimum_investment.replace(/[^0-9.]/g, ''))}
                className="bg-gray-900 border-violet-700 text-white focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvestDialogOpen(false)} className="border-violet-700 text-violet-300 hover:bg-violet-900/20">
              Cancel
            </Button>
            <Button 
              onClick={handleInvest}
              disabled={!investmentAmount || parseFloat(investmentAmount) < parseFloat(startup.minimum_investment.replace(/[^0-9.]/g, ''))}
              className="bg-gradient-to-r from-violet-700 to-indigo-800 hover:from-violet-600 hover:to-indigo-700 text-white disabled:opacity-50"
            >
              Confirm Investment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}