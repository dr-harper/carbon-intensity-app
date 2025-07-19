import React from 'react';
import { Zap, Fuel, Wind, Sun, Atom, Droplets, Leaf, ArrowDownUp } from 'lucide-react';
import { GenerationMix as GenerationMixType } from '../types/carbon';

interface GenerationMixProps {
  generationData: GenerationMixType[];
  isLoading: boolean;
}

const fuelIcons: { [key: string]: React.ReactNode } = {
  gas: <Fuel className="w-5 h-5" />,
  coal: <Fuel className="w-5 h-5" />,
  nuclear: <Atom className="w-5 h-5" />,
  wind: <Wind className="w-5 h-5" />,
  solar: <Sun className="w-5 h-5" />,
  hydro: <Droplets className="w-5 h-5" />,
  biomass: <Leaf className="w-5 h-5" />,
  imports: <ArrowDownUp className="w-5 h-5" />,
  other: <Zap className="w-5 h-5" />
};

const fuelColors: { [key: string]: string } = {
  gas: 'bg-orange-500',
  coal: 'bg-gray-700',
  nuclear: 'bg-purple-500',
  wind: 'bg-blue-500',
  solar: 'bg-yellow-500',
  hydro: 'bg-cyan-500',
  biomass: 'bg-green-600',
  imports: 'bg-indigo-500',
  other: 'bg-gray-400'
};

const fuelDescriptions: { [key: string]: string } = {
  gas: 'Natural Gas',
  coal: 'Coal Power',
  nuclear: 'Nuclear Power',
  wind: 'Wind Power',
  solar: 'Solar Power',
  hydro: 'Hydroelectric',
  biomass: 'Biomass',
  imports: 'Imported Energy',
  other: 'Other Sources'
};

const isRenewable = (fuel: string): boolean => {
  return ['wind', 'solar', 'hydro', 'biomass'].includes(fuel.toLowerCase());
};

const isLowCarbon = (fuel: string): boolean => {
  return ['wind', 'solar', 'hydro', 'biomass', 'nuclear'].includes(fuel.toLowerCase());
};

export default function GenerationMix({ generationData, isLoading }: GenerationMixProps) {
  // Debug logging
  console.log('GenerationMix component received data:', generationData);
  console.log('Data type:', typeof generationData);
  console.log('Is array:', Array.isArray(generationData));
  console.log('Length:', generationData?.length);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Generation Mix
        </h2>
        <div className="animate-pulse space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <div className="flex-1 h-6 bg-gray-300 rounded"></div>
              <div className="w-12 h-4 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle empty or invalid data
  if (!generationData || !Array.isArray(generationData) || generationData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Generation Mix
        </h2>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-lg font-medium">No generation data available</p>
            <p className="text-sm mt-2">Please try refreshing the data</p>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-left">
              <strong>Debug Info:</strong><br/>
              Data type: {typeof generationData}<br/>
              Is array: {Array.isArray(generationData) ? 'Yes' : 'No'}<br/>
              Length: {generationData?.length || 'undefined'}<br/>
              Content: {JSON.stringify(generationData)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter and validate data
  const validData = generationData.filter(item => {
    const isValid = item && 
                   typeof item === 'object' && 
                   item.fuel && 
                   typeof item.fuel === 'string' && 
                   typeof item.perc === 'number' && 
                   !isNaN(item.perc);
    
    if (!isValid) {
      console.log('Invalid generation item:', item);
    }
    
    return isValid;
  });

  console.log('Valid generation data:', validData);

  if (validData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Generation Mix
        </h2>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-lg font-medium">Invalid generation data format</p>
            <p className="text-sm mt-2">The API returned data in an unexpected format</p>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-left">
              <strong>Raw Data:</strong><br/>
              {JSON.stringify(generationData, null, 2)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const renewablePercentage = validData
    .filter(item => isRenewable(item.fuel))
    .reduce((sum, item) => sum + item.perc, 0);
    
  const lowCarbonPercentage = validData
    .filter(item => isLowCarbon(item.fuel))
    .reduce((sum, item) => sum + item.perc, 0);
    
  const fossilPercentage = validData
    .filter(item => ['gas', 'coal'].includes(item.fuel.toLowerCase()))
    .reduce((sum, item) => sum + item.perc, 0);

  // Sort by percentage (highest first)
  const sortedData = [...validData].sort((a, b) => b.perc - a.perc);

  // Calculate total percentage to check data integrity
  const totalPercentage = validData.reduce((sum, item) => sum + item.perc, 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Generation Mix
        </h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">{renewablePercentage.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Renewable</div>
        </div>
      </div>

      {/* Data Integrity Check */}
      {Math.abs(totalPercentage - 100) > 5 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Data may be incomplete (Total: {totalPercentage.toFixed(1)}%)
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 text-center">
          <div className="text-2xl font-bold text-green-600">{renewablePercentage.toFixed(1)}%</div>
          <div className="text-sm text-green-800 font-medium">Renewable</div>
          <div className="text-xs text-green-600 mt-1">Wind, Solar, Hydro, Biomass</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200 text-center">
          <div className="text-2xl font-bold text-purple-600">{lowCarbonPercentage.toFixed(1)}%</div>
          <div className="text-sm text-purple-800 font-medium">Low Carbon</div>
          <div className="text-xs text-purple-600 mt-1">Renewable + Nuclear</div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200 text-center">
          <div className="text-2xl font-bold text-orange-600">{fossilPercentage.toFixed(1)}%</div>
          <div className="text-sm text-orange-800 font-medium">Fossil Fuels</div>
          <div className="text-xs text-orange-600 mt-1">Gas + Coal</div>
        </div>
      </div>

      {/* All Technologies Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Energy Sources</h3>
        
        {sortedData.map((item, index) => {
          const fuelKey = item.fuel.toLowerCase();
          const isRenewableSource = isRenewable(item.fuel);
          const isLowCarbonSource = isLowCarbon(item.fuel);
          
          return (
            <div key={`${item.fuel}-${index}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-lg ${fuelColors[fuelKey] || 'bg-gray-400'} text-white shadow-sm`}>
                {fuelIcons[fuelKey] || <Zap className="w-5 h-5" />}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {fuelDescriptions[fuelKey] || item.fuel}
                    </span>
                    <div className="flex gap-1">
                      {isRenewableSource && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Renewable
                        </span>
                      )}
                      {isLowCarbonSource && !isRenewableSource && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                          Low Carbon
                        </span>
                      )}
                      {!isLowCarbonSource && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                          Fossil Fuel
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {item.perc.toFixed(1)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-700 ease-out ${fuelColors[fuelKey] || 'bg-gray-400'}`}
                    style={{ 
                      width: `${Math.max(item.perc, 0.5)}%`,
                      minWidth: item.perc > 0 ? '4px' : '0px'
                    }}
                  />
                </div>
                
                {item.perc === 0 && (
                  <div className="text-xs text-gray-500 mt-1">Currently not generating</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Environmental Impact Summary */}
      <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 text-lg">Environmental Impact</h4>
          <div className="flex items-center gap-2">
            {lowCarbonPercentage > 70 ? (
              <span className="text-2xl">🌱</span>
            ) : lowCarbonPercentage > 50 ? (
              <span className="text-2xl">⚡</span>
            ) : (
              <span className="text-2xl">🔥</span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Current Status:</p>
            <p className="text-sm text-gray-600">
              {lowCarbonPercentage > 70 
                ? '🌱 Excellent! Very high clean energy share - great for the environment!'
                : lowCarbonPercentage > 50 
                ? '⚡ Good clean energy mix - moderate environmental impact'
                : '🔥 High fossil fuel usage - higher carbon emissions'
              }
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Carbon Intensity Impact</div>
            <div className="text-lg font-bold text-blue-600">
              {lowCarbonPercentage > 70 ? 'Very Low' : 
               lowCarbonPercentage > 50 ? 'Moderate' : 'High'}
            </div>
          </div>
        </div>
        
        {/* Technology Breakdown Summary */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">{renewablePercentage.toFixed(0)}%</div>
              <div className="text-xs text-gray-600">Renewable</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {validData.find(item => item.fuel.toLowerCase() === 'nuclear')?.perc.toFixed(0) || '0'}%
              </div>
              <div className="text-xs text-gray-600">Nuclear</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {validData.find(item => item.fuel.toLowerCase() === 'gas')?.perc.toFixed(0) || '0'}%
              </div>
              <div className="text-xs text-gray-600">Gas</div>
            </div>
            <div>
              <div className="text-lg font-bold text-indigo-600">
                {validData.find(item => item.fuel.toLowerCase() === 'imports')?.perc.toFixed(0) || '0'}%
              </div>
              <div className="text-xs text-gray-600">Imports</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}