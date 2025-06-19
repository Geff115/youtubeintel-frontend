import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChannelGrowthChartProps {
  timeRange: string
}

const generateGrowthData = (timeRange: string) => {
  const dataPoints = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
  return Array.from({ length: dataPoints }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (dataPoints - i - 1))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      subscribers: Math.floor(Math.random() * 1000) + 5000 + (i * 100),
      views: Math.floor(Math.random() * 50000) + 100000 + (i * 1000)
    }
  })
}

export function ChannelGrowthChart({ timeRange }: ChannelGrowthChartProps) {
  const data = generateGrowthData(timeRange)

  return (
    <div className="h-64 sm:h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="subscribers" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            name="Subscribers"
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}