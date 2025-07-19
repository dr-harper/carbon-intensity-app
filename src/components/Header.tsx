import React from 'react';
import { Activity, Zap, TrendingDown, TrendingUp } from 'lucide-react';
import { CarbonIntensity } from '../types/carbon';
import { getIntensityLevel } from '../utils/api';

interface HeaderProps {
  currentData: CarbonIntensity | null;
  isLoading: boolean;
}

export default function Header({ currentData, isLoading }: HeaderProps) {
  if (isLoading) {
    return (
      <header className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded w-64 mx-auto mb-4"></div>
              <div className="h-16 bg-white/20 rounded w-32 mx-auto mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const intensity = currentData?.intensity.actual || currentData?.intensity.forecast || 0;
  const level = getIntensityLevel(intensity);
  const isActual = currentData?.intensity.actual !== undefined;

  return (
    <header className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-8 h-8" />
            <h1 className="text-4xl font-bold">UK Carbon Intensity</h1>
          </div>
          <p className="text-xl opacity-90">Real-time electricity carbon emissions data</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-6 h-6" />
                  <span className="text-lg font-semibold">Current Intensity</span>
                </div>
                <div className="text-5xl font-bold mb-2">{intensity}</div>
                <div className="text-sm opacity-80">gCO₂/kWh</div>
                <div className="mt-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${level.bgColor} ${level.color}`}>
                    {level.level}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isActual ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                  <span className="text-lg font-semibold">Status</span>
                </div>
                <div className="text-2xl font-bold mb-2">
                  {isActual ? 'Live Data' : 'Forecast'}
                </div>
                <div className="text-sm opacity-80">
                  {currentData ? new Date(currentData.from).toLocaleTimeString('en-GB', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : '--:--'}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="w-6 h-6" />
                  <span className="text-lg font-semibold">Impact</span>
                </div>
                <div className="text-lg font-semibold mb-2">{level.description}</div>
                <div className="text-sm opacity-80">
                  {intensity < 200 ? '🌱 Great for the environment' : 
                   intensity < 300 ? '⚡ Moderate impact' : '🔥 High carbon emissions'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}