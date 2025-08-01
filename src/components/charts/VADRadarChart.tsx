import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatRadarData } from '@/utils/hormoneCalculations';
import type { VAD } from '@/types/hormone';

export interface VADRadarChartProps {
  vad: VAD;
  title?: string;
  height?: number;
}

/**
 * VAD因子雷达图组件
 * 基于VAD三维模型可视化当前情绪状态
 */
export const VADRadarChart: React.FC<VADRadarChartProps> = ({ 
  vad, 
  // title = "VAD因子雷达图",
  height = 250 
}) => {
  const radarData = formatRadarData(vad);

  return (
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={radarData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <PolarGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fontSize: 12 }} 
              className="text-sm"
            />
            <PolarRadiusAxis 
              domain={[0, 100]} 
              tick={{ fontSize: 10 }} 
              className="text-xs"
            />
            <Radar 
              dataKey="value" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
  );
};