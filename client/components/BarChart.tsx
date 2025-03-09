"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shared/card"

interface BarChartCardProps {
  data: number[]
  labels: string[]
  label: string
  color: string
}

export function BarChartCard({ data, labels, label, color }: BarChartCardProps) {
  // Transform the data into the format recharts expects
  const chartData = labels.map((label, index) => ({
    name: label,
    value: data[index]
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart - Multiple</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="h-full h-[100px]">
        <div className="w-full h-[200px]">
          <BarChart width={400} height={200} data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              formatter={(value) => [`${value}`, label]}
              labelStyle={{ color: '#666' }}
              contentStyle={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey="value" 
              fill={color} 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </div>
      </CardFooter>
    </Card>
  )
}
