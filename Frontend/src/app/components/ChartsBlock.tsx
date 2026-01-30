import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartsBlockProps {
  trendData: Array<{ month: string; pm25: number; pm10: number }>;
}

export function ChartsBlock({ trendData }: ChartsBlockProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Line Chart - PM2.5 Trend */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-[#09637E] mb-4">PM2.5 Trend (2025)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              stroke="#D1D5DB"
            />
            <YAxis 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              stroke="#D1D5DB"
              label={{ value: 'μg/m³', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="pm25" 
              stroke="#088395" 
              strokeWidth={3}
              dot={{ fill: '#088395', r: 4 }}
              activeDot={{ r: 6 }}
              name="PM2.5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - PM2.5 vs PM10 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-[#09637E] mb-4">PM2.5 vs PM10 Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trendData.slice(0, 6)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              stroke="#D1D5DB"
            />
            <YAxis 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              stroke="#D1D5DB"
              label={{ value: 'μg/m³', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <Bar 
              dataKey="pm25" 
              fill="#088395" 
              radius={[8, 8, 0, 0]}
              name="PM2.5"
            />
            <Bar 
              dataKey="pm10" 
              fill="#7AB2B2" 
              radius={[8, 8, 0, 0]}
              name="PM10"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}