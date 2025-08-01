import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface EmotionVAD {
  emotion: string;
  valence: number;
  dominance: number;
  arousal: number;
}

interface EmotionCircleChartProps {
  emotions: EmotionVAD[];
}

/**
 * 二维情绪分布图组件
 * 将情绪数据映射到二维坐标系中
 * X轴：Valence（负-正）
 * Y轴：Dominance（被动-主动）
 */
const EmotionCircleChart: React.FC<EmotionCircleChartProps> = ({ emotions }) => {
  // SVG 画布尺寸
  const width = 400;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 160;
  const dotRadius = 4; // 统一圆点半径

  /**
   * 将VAD坐标映射到SVG坐标
   * Valence: -1到1 → X轴
   * Dominance: -1到1 → Y轴（注意Y轴方向：上方为正向）
   */
  const mapToSVG = (valence: number, dominance: number) => {
    const x = centerX + valence * radius;
    const y = centerY - dominance * radius; // 反转Y轴方向
    return { x, y };
  };

  // 生成坐标轴刻度和标签
  const axisLabels = [
    { text: '负', x: centerX - radius - 20, y: centerY },
    { text: '正', x: centerX + radius + 20, y: centerY },
    { text: '被动', x: centerX, y: centerY + radius + 20 },
    { text: '主动', x: centerX, y: centerY - radius - 20 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">情绪分布图</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <svg width={width} height={height} className="border rounded-lg bg-gray-50">
            {/* 背景网格 */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* 坐标轴 */}
            <line
              x1={centerX - radius}
              y1={centerY}
              x2={centerX + radius}
              y2={centerY}
              stroke="#d1d5db"
              strokeWidth="2"
            />
            <line
              x1={centerX}
              y1={centerY - radius}
              x2={centerX}
              y2={centerY + radius}
              stroke="#d1d5db"
              strokeWidth="2"
            />

            {/* 坐标轴标签 */}
            {axisLabels.map((label, index) => (
              <text
                key={index}
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill="#6b7280"
                fontWeight="500"
              >
                {label.text}
              </text>
            ))}

            {/* 中心点标记 */}
            <circle cx={centerX} cy={centerY} r="3" fill="#9ca3af" />

            {/* 情绪点 */}
            {emotions.map((emotion, index) => {
              const { x, y } = mapToSVG(emotion.valence, emotion.dominance);
              
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r={dotRadius}
                    fill="#3b82f6"
                    fillOpacity={0.8}
                    stroke="#1d4ed8"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={y - dotRadius - 5}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#374151"
                    fontWeight="500"
                  >
                    {emotion.emotion}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* 图例 */}
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>情绪点</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              X轴：Valence（负-正）| Y轴：Dominance（被动-主动）
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionCircleChart;