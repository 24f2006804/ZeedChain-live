import { AlertTriangle, CheckCircle, TrendingUp, Shield } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface RiskAnalysisCardProps {
  startupName: string
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export function RiskAnalysisCard({
  startupName,
  strengths,
  weaknesses,
  opportunities,
  threats,
}: RiskAnalysisCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden h-full">
      <CardHeader className="bg-gradient-to-r from-emerald-900 to-emerald-800 pb-3 pt-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold tracking-tight text-white">Belford's Risk Analysis</h2>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-green-400">Strengths</h3>
            </div>
            <ul className="list-disc list-inside text-zinc-300 space-y-1 pl-2">
              {strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-yellow-400">Weaknesses</h3>
            </div>
            <ul className="list-disc list-inside text-zinc-300 space-y-1 pl-2">
              {weaknesses.map((weakness, index) => (
                <li key={index}>{weakness}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-blue-400">Opportunities</h3>
            </div>
            <ul className="list-disc list-inside text-zinc-300 space-y-1 pl-2">
              {opportunities.map((opportunity, index) => (
                <li key={index}>{opportunity}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-red-400">Threats</h3>
            </div>
            <ul className="list-disc list-inside text-zinc-300 space-y-1 pl-2">
              {threats.map((threat, index) => (
                <li key={index}>{threat}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

