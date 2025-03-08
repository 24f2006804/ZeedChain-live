import { Card, CardContent } from "@/components/ui/card"

interface FinancialThoughtsCardProps {
  text: string
}

export function FinancialThoughtsCard({ text }: FinancialThoughtsCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden h-full flex flex-col">
      <CardContent className="p-6 flex-grow">
        <h3 className="text-lg font-semibold text-white mb-3">Belfords Financial Thoughts</h3>
        <div className="bg-zinc-800 p-4 rounded-lg border-l-4 border-yellow-500">
          <p className="text-zinc-300">{text}</p>
        </div>
      </CardContent>
    </Card>
  )
}
