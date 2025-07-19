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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Cleanest Region</span>
              </div>
              <h3 className="text-xl font-bold text-green-900">{bestRegion?.dnoregion}</h3>
              <p className="text-sm text-green-700">{bestRegion?.shortname}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{bestRegion?.intensity.forecast}</div>
              <div className="text-xs text-green-600">gCO₂/kWh</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800">Highest Intensity</span>
              </div>
              <h3 className="text-xl font-bold text-red-900">{worstRegion?.dnoregion}</h3>
              <p className="text-sm text-red-700">{worstRegion?.shortname}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-red-600">{worstRegion?.intensity.forecast}</div>
              <div className="text-xs text-red-600">gCO₂/kWh</div>
            </div>
          </div>
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

      {/* Enhanced Legend */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 text-lg">Carbon Intensity Scale</h4>
          <div className="text-sm text-gray-600">
            Difference: {(worstRegion?.intensity.forecast - bestRegion?.intensity.forecast).toFixed(0)} gCO₂/kWh
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div className="flex items-center gap-2 p-2 bg-green-100 rounded-lg">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <div>
              <div className="text-xs font-medium text-green-800">Very Low</div>
              <div className="text-xs text-green-600">&lt;100</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-emerald-100 rounded-lg">
            <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
            <div>
              <div className="text-xs font-medium text-emerald-800">Low</div>
              <div className="text-xs text-emerald-600">100-200</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-yellow-100 rounded-lg">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <div>
              <div className="text-xs font-medium text-yellow-800">Moderate</div>
              <div className="text-xs text-yellow-600">200-300</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-orange-100 rounded-lg">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <div>
              <div className="text-xs font-medium text-orange-800">High</div>
              <div className="text-xs text-orange-600">300-400</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-red-100 rounded-lg">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <div>
              <div className="text-xs font-medium text-red-800">Very High</div>
              <div className="text-xs text-red-600">&gt;400</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            💡 <strong>Tip:</strong> Consider moving energy-intensive activities to regions with lower carbon intensity when possible
          </p>
        </div>
      </div>
    </div>
  );
}