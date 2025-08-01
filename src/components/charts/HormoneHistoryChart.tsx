import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HORMONE_KEYS, hormoneColors } from '@/constants/hormone';
import { HORMONE_TRANSLATIONS } from '@/constants/translations';
import type { HistoryData } from '@/types/hormone';
import type { Language } from '@/constants/translations';

export interface HormoneHistoryChartProps {
  data: HistoryData[];
  language: Language;
  title?: string;
  height?: number;
}

/**
 * 激素水平历史折线图组件
 * 展示所有激素水平随时间变化的趋势
 */
export const HormoneHistoryChart: React.FC<HormoneHistoryChartProps> = ({ 
  data, 
  language,
  title = "激素水平历史",
  height = 300 
}) => {
  const t = (hormoneKey: keyof typeof HORMONE_TRANSLATIONS) => {
    return HORMONE_TRANSLATIONS[hormoneKey][language];
  };

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
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
            />
            {HORMONE_KEYS.map(hormone => (
              <Line 
                key={hormone}
                type="monotone" 
                dataKey={hormone} 
                stroke={hormoneColors[hormone]} 
                name={t(hormone as keyof typeof HORMONE_TRANSLATIONS)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                animationDuration={300}
                animationEasing="linear"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};