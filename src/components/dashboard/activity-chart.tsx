import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface ActivityChartProps {
  timeRange: string
}

// Mock data - replace with real API data
const generateMockData = (timeRange: string) => {
  const dataPoints = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
  const data = []
  
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (dataPoints - i - 1))
    
    data.push({
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        ...(timeRange === '1y' && { year: '2-digit' })
      }),
      channels: Math.floor(Math.random() * 50) + 10,
      videos: Math.floor(Math.random() * 200) + 50,
      credits: Math.floor(Math.random() * 30) + 5
    })
  }
  
  return data
}

export function ActivityChart({ timeRange }: ActivityChartProps) {
  const data = generateMockData(timeRange)

  return (
    <div className="h-64 sm:h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="channelsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="videosGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            className="text-slate-500 dark:text-slate-400"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            className="text-slate-500 dark:text-slate-400"
          />
          
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelStyle={{ color: '#1e293b' }}
          />
          
          <Area
            type="monotone"
            dataKey="channels"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#channelsGradient)"
            name="Channels Discovered"
          />
          
          <Area
            type="monotone"
            dataKey="videos"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#videosGradient)"
            name="Videos Analyzed"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}