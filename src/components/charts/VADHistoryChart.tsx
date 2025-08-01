import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { HistoryData } from '@/types/hormone';

export interface VADHistoryChartProps {
  data: HistoryData[];
  title?: string;
  height?: number;
}

/**
 * VAD历史折线图组件
 * 展示Arousal、Valence、Dominance随时间变化的趋势
 */
export const VADHistoryChart: React.FC<VADHistoryChartProps> = ({ 
  data, 
  title = "VAD因子历史",
  height = 300 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart 
            data={data} 
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              type="number"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              domain={[0, 100]} 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: 12,
                padding: '16px',
                zIndex: 1000
              }}
              formatter={(value: number, name: string) => [
                value.toFixed(1),
                name
              ]}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              fontSize={12}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="arousal" 
              stroke="#ef4444" 
              name="Arousal" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 4 }}
              animationDuration={0}  // 禁用动画
              isAnimationActive={false}  // 完全禁用动画
            />
            <Line 
              type="monotone" 
              dataKey="valence" 
              stroke="#22c55e" 
              name="Valence" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 4 }}
              animationDuration={0}  // 禁用动画
              isAnimationActive={false}  // 完全禁用动画
            />
            <Line 
              type="monotone" 
              dataKey="dominance" 
              stroke="#3b82f6" 
              name="Dominance" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 4 }}
              animationDuration={0}  // 禁用动画
              isAnimationActive={false}  // 完全禁用动画
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};