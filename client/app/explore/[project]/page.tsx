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
      <div className="min-h-screen p-10 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Connect Wallet to View Startup Details</h1>
        <Button onClick={connectWallet}>Connect Wallet</Button>
      </div>
    )
  }

  if (!startup) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="text-xl">Loading startup details...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={startup.logo_url}
              alt={startup.startup_name}
              className="w-20 h-20 rounded-full border-2 border-gray-800"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-bold">{startup.startup_name}</h1>
                {startup.verified && <CheckCircle className="text-blue-500 h-6 w-6" />}
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{startup.industry}</Badge>
                <Badge variant="outline">{startup.university_affiliation}</Badge>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsInvestDialogOpen(true)}
            className="bg-gradient-to-r from-[#267871] to-[#136a8a] hover:from-[#1b5d5a] hover:to-[#0f566e]"
          >
            Invest Now
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{startup.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funding Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={startup.funding_progress} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>${((startup.funding_progress / 100) * parseInt(startup.total_amount_being_raised.replace(/\D/g, ''))) / 1000}K raised</span>
                  <span>{startup.total_amount_being_raised} goal</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Investment Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-gray-400">
                  <CircleDollarSign />
                  <div>
                    <div className="font-medium text-white">{startup.current_valuation}</div>
                    <div className="text-sm">Current Valuation</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Users2 />
                  <div>
                    <div className="font-medium text-white">{startup.available_equity_offered}</div>
                    <div className="text-sm">Available Equity</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Building2 />
                  <div>
                    <div className="font-medium text-white">{startup.minimum_investment}</div>
                    <div className="text-sm">Minimum Investment</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <TrendingUp />
                  <div>
                    <div className="font-medium text-white">{startup.days_left} Days</div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invest in {startup.startup_name}</DialogTitle>
            <DialogDescription>
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvestDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInvest}
              disabled={!investmentAmount || parseFloat(investmentAmount) < parseFloat(startup.minimum_investment.replace(/[^0-9.]/g, ''))}
            >
              Confirm Investment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

