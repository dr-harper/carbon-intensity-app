import React, { useState, useEffect } from 'react';
import { RefreshCw, Bot, Key } from 'lucide-react';
import Header from './components/Header';
import RegionalMap from './components/RegionalMap';
import IntensityChart from './components/IntensityChart';
import GenerationMix from './components/GenerationMix';
import AIAssistant from './components/AIAssistant';
import Footer from './components/Footer';
import { CarbonIntensity, RegionalData, GenerationMix as GenerationMixType } from './types/carbon';
import { getCurrentIntensity, getIntensityForecast, getRegionalData, getGenerationMix } from './utils/api';

function App() {
  const [currentData, setCurrentData] = useState<CarbonIntensity | null>(null);
  const [forecastData, setForecastData] = useState<CarbonIntensity[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [generationData, setGenerationData] = useState<GenerationMixType[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [userApiKey, setUserApiKey] = useState<string | null>(null);

  // Check for API key from environment or user input
  const hasGeminiKey = import.meta.env.VITE_GEMINI_API_KEY || userApiKey;

  // Load saved API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setUserApiKey(savedApiKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      // Basic validation - Gemini API keys start with "AIza"
      if (!apiKeyInput.startsWith('AIza')) {
        alert('Invalid API key format. Gemini API keys should start with "AIza"');
        return;
      }
      
      localStorage.setItem('gemini_api_key', apiKeyInput.trim());
      setUserApiKey(apiKeyInput.trim());
      setApiKeyInput('');
      setShowApiKeyPrompt(false);
      
      // Show success message
      alert('✅ API key saved successfully! AI Assistant is now active.');
    }
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setUserApiKey(null);
    setApiKeyInput('');
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [current, forecast, regional, generation] = await Promise.all([
        getCurrentIntensity(),
        getIntensityForecast(48), // Request 48 hours of forecast data
        getRegionalData(),
        getGenerationMix()
      ]);

      //console.log('Generation Mix Response:', generation);

      if (current?.data?.[0]) {
        setCurrentData(current.data[0]);
      }

      if (forecast?.data) {
        setForecastData(forecast.data);
      }

      if (regional?.data?.[0]?.regions) {
        setRegionalData(regional.data[0].regions);
      }

      // Debug the generation API response
      console.log('Full generation API response:', generation);

    if (generation?.data?.generationmix) {
      console.log('Generation mix found:', generation.data.generationmix);
      setGenerationData(generation.data.generationmix);
    } else if (generation?.data) {
      console.log('Generation mix not found in response:', generation.data);
      setGenerationData([]);
    } else {
      console.log('No data property in generation response');
      setGenerationData([]);
    }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    // Refresh data every 30 minutes
    const interval = setInterval(fetchAllData, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* AI Assistant Setup Banner */}
      {!hasGeminiKey && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white sticky top-0 z-50 shadow-lg">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg animate-pulse">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">🚀 Unlock AI-Powered Energy Insights!</h3>
                  <p className="text-sm opacity-90">Get personalized advice on EV charging, appliance timing, and energy savings</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiKeyPrompt(!showApiKeyPrompt)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 animate-bounce"
              >
                <Key className="w-4 h-4" />
                Setup AI Assistant
              </button>
            </div>
            
            {showApiKeyPrompt && (
              <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  🔑 Setup Your Free Gemini API Key
                </h4>
                
                <div className="space-y-4">
                  {/* API Key Input Section */}
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h5 className="font-medium mb-3">Enter Your API Key:</h5>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="AIzaSy... (paste your Gemini API key here)"
                        className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                      <button
                        onClick={handleSaveApiKey}
                        disabled={!apiKeyInput.trim()}
                        className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save
                      </button>
                    </div>
                    <p className="text-xs mt-2 opacity-80">🔒 Your API key is stored locally in your browser and never sent to our servers</p>
                  </div>

                  {/* Instructions */}
                  <div className="bg-white/10 p-3 rounded-lg">
                    <p className="font-medium mb-2">How to get your free API key:</p>
                    <ol className="space-y-1 list-decimal list-inside text-sm">
                      <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-200 font-medium">Google AI Studio</a></li>
                      <li>Sign in with your Google account (free)</li>
                      <li>Click "Create API Key" button</li>
                      <li>Copy the generated key and paste it above</li>
                    </ol>
                  </div>

                  <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                    <p className="font-medium">💡 Why add AI?</p>
                    <p className="text-xs mt-1">Get smart recommendations for when to charge your EV, run appliances, and save money on electricity bills!</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Get Free API Key
                  </a>
                  <button
                    onClick={() => setShowApiKeyPrompt(false)}
                    className="text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Active Banner */}
      {hasGeminiKey && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="container mx-auto px-6 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <span className="text-sm font-medium">🤖 AI Assistant Active - Powered by Google Gemini</span>
              </div>
              <button
                onClick={handleRemoveApiKey}
                className="text-white/80 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors"
              >
                Remove API Key
              </button>
            </div>
          </div>
        </div>
      )}

      <Header currentData={currentData} isLoading={loading} />
      
      <main className="container mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Live Dashboard</h2>
            <p className="text-gray-600 mt-2">Real-time carbon intensity monitoring across the UK</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            {lastUpdated && (
              <div className="text-sm text-gray-600">
                Last updated: {lastUpdated.toLocaleTimeString('en-GB')}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <IntensityChart forecastData={forecastData} isLoading={loading} />
          <GenerationMix generationData={generationData} isLoading={loading} />
        </div>

        <RegionalMap regionalData={regionalData} isLoading={loading} />
      </main>

      <Footer />
      
      {/* AI Assistant */}
      <AIAssistant 
        currentData={currentData}
        forecastData={forecastData}
        regionalData={regionalData}
        generationData={generationData}
        userApiKey={userApiKey}
      />
    </div>
  );
}

export default App;