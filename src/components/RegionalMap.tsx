import React from 'react';
import { MapPin, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { RegionalData } from '../types/carbon';
import { getIntensityLevel } from '../utils/api';

interface RegionalMapProps {
  regionalData: RegionalData[];
  isLoading: boolean;
}

export default function RegionalMap({ regionalData, isLoading }: RegionalMapProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          Regional Carbon Intensity
        </h2>
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
              <div className="h-4 bg-gray-300 rounded w-32"></div>
              <div className="h-6 bg-gray-300 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sortedRegions = [...regionalData].sort((a, b) => a.intensity.forecast - b.intensity.forecast);
  const bestRegion = sortedRegions[0];
  const worstRegion = sortedRegions[sortedRegions.length - 1];
  const averageIntensity = sortedRegions.reduce((sum, region) => sum + region.intensity.forecast, 0) / sortedRegions.length;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          Regional Carbon Intensity
        </h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{averageIntensity.toFixed(0)}</div>
          <div className="text-sm text-gray-600">UK Average</div>
        </div>
      </div>

      {/* Compact summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center text-sm">
        <div>
          <div className="font-medium flex items-center justify-center gap-1 mb-1 text-green-700">
            <TrendingDown className="w-4 h-4" /> Cleanest
          </div>
          <div className="font-bold text-green-600 text-lg">{bestRegion?.intensity.forecast}</div>
          <div className="text-gray-600 text-xs">{bestRegion?.shortname}</div>
        </div>
        <div>
          <div className="font-medium text-gray-700 mb-1">UK Avg</div>
          <div className="font-bold text-gray-900 text-lg">{averageIntensity.toFixed(0)}</div>
          <div className="text-gray-600 text-xs">gCO₂/kWh</div>
        </div>
        <div>
          <div className="font-medium flex items-center justify-center gap-1 mb-1 text-red-700">
            <TrendingUp className="w-4 h-4" /> Highest
          </div>
          <div className="font-bold text-red-600 text-lg">{worstRegion?.intensity.forecast}</div>
          <div className="text-gray-600 text-xs">{worstRegion?.shortname}</div>
        </div>
      </div>

      {/* Regional Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {sortedRegions.map((region, index) => {
          const level = getIntensityLevel(region.intensity.forecast);
          const isTop3 = index < 3;
          const isBottom3 = index >= sortedRegions.length - 3;
          
          return (
            <div 
              key={region.regionid}
              className={`relative p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer group ${
                isTop3 
                  ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-300' 
                  : isBottom3 
                  ? 'border-red-200 bg-gradient-to-br from-red-50 to-orange-50 hover:border-red-300'
                  : 'border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 hover:border-blue-300'
              }`}
            >
              {/* Ranking Badge */}
              <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                isTop3 ? 'bg-green-500' : isBottom3 ? 'bg-red-500' : 'bg-gray-400'
              }`}>
                #{index + 1}
              </div>

              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg leading-tight">
                    {region.dnoregion}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{region.shortname}</p>
                </div>
                
                <div className={`p-2 rounded-lg ml-3 ${
                  isTop3 ? 'bg-green-100' : isBottom3 ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <Zap className={`w-4 h-4 ${
                    isTop3 ? 'text-green-600' : isBottom3 ? 'text-red-600' : 'text-blue-600'
                  }`} />
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {region.intensity.forecast}
                  </div>
                  <div className="text-xs text-gray-500">gCO₂/kWh</div>
                </div>
                
                <div className="text-right">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${level.bgColor} ${level.color}`}>
                    {level.level}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {region.intensity.forecast < averageIntensity ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Below avg
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Above avg
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Intensity Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      level.level === 'Very Low' ? 'bg-green-500' :
                      level.level === 'Low' ? 'bg-emerald-500' :
                      level.level === 'Moderate' ? 'bg-yellow-500' :
                      level.level === 'High' ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min((region.intensity.forecast / 500) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact scale */}
      <div className="border-t pt-4">
        <p className="text-center text-xs text-gray-600 mb-2">
          Difference: {(worstRegion?.intensity.forecast - bestRegion?.intensity.forecast).toFixed(0)} gCO₂/kWh
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span>Very Low</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span>Low</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span>Moderate</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span>High</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span>Very High</span>
        </div>
      </div>
    </div>
  );
}