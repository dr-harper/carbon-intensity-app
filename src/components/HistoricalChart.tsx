import React from 'react';
import { History } from 'lucide-react';
import { CarbonIntensity } from '../types/carbon';
import { getIntensityLevel } from '../utils/api';

interface HistoricalChartProps {
  historicalData: CarbonIntensity[];
  isLoading: boolean;
}

export default function HistoricalChart({ historicalData, isLoading }: HistoricalChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <History className="w-6 h-6" />
          Past 24 Hours
        </h2>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <History className="w-6 h-6" />
          Past 24 Hours
        </h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No historical data available
        </div>
      </div>
    );
  }

  const displayData = historicalData.slice(-48); // 30-min intervals
  const maxIntensity = Math.max(...displayData.map(d => d.intensity.forecast));
  const minIntensity = Math.min(...displayData.map(d => d.intensity.forecast));

  const chartHeight = 280;
  const chartWidth = 800;
  const padding = { top: 20, right: 40, bottom: 60, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const chartMin = 0;
  const chartMax = Math.max(maxIntensity * 1.1, 100);
  const yScale = (value: number) => innerHeight - ((value - chartMin) / (chartMax - chartMin)) * innerHeight;
  const xScale = (index: number) => (index / (displayData.length - 1)) * innerWidth;

  const generatePath = () => {
    return displayData.map((data, index) => {
      const x = xScale(index);
      const y = yScale(data.intensity.forecast);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const generateAreaPath = () => {
    const linePath = generatePath();
    const firstPoint = `${xScale(0)} ${yScale(0)}`;
    const lastPoint = `${xScale(displayData.length - 1)} ${yScale(0)}`;
    return `${linePath} L ${lastPoint} L ${firstPoint} Z`;
  };

  const yTicks = [0, chartMax * 0.25, chartMax * 0.5, chartMax * 0.75, chartMax];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <History className="w-6 h-6" />
          Past 24 Hours
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="font-medium">Peak: {maxIntensity} gCO₂/kWh</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Low: {minIntensity} gCO₂/kWh</span>
          </div>
        </div>
      </div>

      <div className="relative bg-gradient-to-t from-gray-50 to-white rounded-lg border border-gray-100 overflow-hidden">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="w-full h-auto"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          <defs>
            <linearGradient id="histAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="histLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>

          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {yTicks.map((tick, index) => (
              <line
                key={index}
                x1={0}
                y1={yScale(tick)}
                x2={innerWidth}
                y2={yScale(tick)}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray={index === 0 ? 'none' : '2,2'}
              />
            ))}

            {displayData.map((_, index) => {
              if (index % 4 === 0) {
                return (
                  <line
                    key={index}
                    x1={xScale(index)}
                    y1={0}
                    x2={xScale(index)}
                    y2={innerHeight}
                    stroke="#F3F4F6"
                    strokeWidth="1"
                  />
                );
              }
              return null;
            })}

            <path d={generateAreaPath()} fill="url(#histAreaGradient)" />
            <path
              d={generatePath()}
              fill="none"
              stroke="url(#histLineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />

            {displayData.map((data, index) => {
              const level = getIntensityLevel(data.intensity.forecast);
              const time = new Date(data.from);
              return (
                <g key={index}>
                  <circle
                    cx={xScale(index)}
                    cy={yScale(data.intensity.forecast)}
                    r="4"
                    fill={
                      level.level === 'Very Low' ? '#10B981' :
                      level.level === 'Low' ? '#059669' :
                      level.level === 'Moderate' ? '#F59E0B' :
                      level.level === 'High' ? '#F97316' : '#EF4444'
                    }
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer hover:r-6 transition-all duration-200"
                  />
                  <g className="opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <rect
                      x={xScale(index) - 35}
                      y={yScale(data.intensity.forecast) - 45}
                      width="70"
                      height="35"
                      rx="6"
                      fill="#1F2937"
                      className="drop-shadow-lg"
                    />
                    <text
                      x={xScale(index)}
                      y={yScale(data.intensity.forecast) - 30}
                      textAnchor="middle"
                      className="text-xs font-bold fill-white"
                    >
                      {data.intensity.forecast}
                    </text>
                    <text
                      x={xScale(index)}
                      y={yScale(data.intensity.forecast) - 18}
                      textAnchor="middle"
                      className="text-xs fill-gray-300"
                    >
                      {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {yTicks.map((tick, index) => (
            <text
              key={index}
              x={padding.left - 10}
              y={padding.top + yScale(tick) + 4}
              textAnchor="end"
              className="text-xs fill-gray-500 font-medium"
            >
              {Math.round(tick)}
            </text>
          ))}

          {displayData.map((data, index) => {
            if (index % 6 === 0 || index === displayData.length - 1) {
              const time = new Date(data.from);
              return (
                <text
                  key={index}
                  x={padding.left + xScale(index)}
                  y={chartHeight - 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </text>
              );
            }
            return null;
          })}

          <text
            x={padding.left - 40}
            y={chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, ${padding.left - 40}, ${chartHeight / 2})`}
            className="text-sm fill-gray-700 font-medium"
          >
            Carbon Intensity (gCO₂/kWh)
          </text>

          <text
            x={chartWidth / 2}
            y={chartHeight - 5}
            textAnchor="middle"
            className="text-sm fill-gray-700 font-medium"
          >
            Time (24-hour format)
          </text>
        </svg>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {displayData.length > 0 ? displayData[displayData.length - 1].intensity.forecast : 0}
          </div>
          <div className="text-sm text-gray-600 font-medium">Latest</div>
          <div className="text-xs text-gray-500 mt-1">gCO₂/kWh</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">{minIntensity}</div>
          <div className="text-sm text-gray-600 font-medium">Daily Low</div>
          <div className="text-xs text-gray-500 mt-1">Past 24h best</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-red-600">{maxIntensity}</div>
          <div className="text-sm text-gray-600 font-medium">Daily High</div>
          <div className="text-xs text-gray-500 mt-1">Past 24h worst</div>
        </div>
      </div>
    </div>
  );
}
