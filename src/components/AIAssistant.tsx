import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, MicOff, Sparkles, AlertCircle } from 'lucide-react';
import { CarbonIntensity, RegionalData, GenerationMix } from '../types/carbon';
import { generateGeminiResponse } from '../utils/gemini';

interface AIAssistantProps {
  currentData: CarbonIntensity | null;
  forecastData: CarbonIntensity[];
  regionalData: RegionalData[];
  generationData: GenerationMix[];
  userApiKey?: string | null;
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function AIAssistant({ currentData, forecastData, regionalData, generationData, userApiKey }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if AI is available
  const hasApiKey = import.meta.env.VITE_GEMINI_API_KEY || userApiKey;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && hasApiKey) {
      // Welcome message when first opened
      const currentIntensity = currentData?.intensity.actual || currentData?.intensity.forecast || 0;
      const renewablePercentage = generationData
        .filter(item => ['wind', 'solar', 'hydro', 'biomass'].includes(item.fuel.toLowerCase()))
        .reduce((sum, item) => sum + item.perc, 0);

      // Get forecast summary for welcome message
      const forecastSummary = getForecastSummary(forecastData);

      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `🌟 Hello! I'm your AI-powered Carbon Assistant, powered by Google Gemini.

**Current Status:**
⚡ Carbon Intensity: ${currentIntensity} gCO₂/kWh
🌱 Renewable Energy: ${renewablePercentage.toFixed(1)}%

**48-Hour Forecast:**
${forecastSummary}

I can help you:
• Find optimal times for EV charging over the next 2 days
• Plan energy-efficient appliance usage with specific timing
• Compare regional carbon intensity
• Understand renewable energy trends
• Calculate your carbon savings
• Provide detailed 48-hour energy planning

What would you like to know about UK energy today and tomorrow?`,
        timestamp: new Date(),
        suggestions: [
          "When should I charge my EV over the next 48 hours?",
          "What are the best times tomorrow?",
          "Show me the cleanest hours this week",
          "Plan my energy usage for the weekend"
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, currentData, generationData, forecastData, hasApiKey]);

  const getForecastSummary = (forecast: CarbonIntensity[]): string => {
    if (!forecast || forecast.length === 0) {
      return "📊 No forecast data available";
    }

    const next48Hours = forecast.slice(0, 48);
    const sortedByIntensity = [...next48Hours].sort((a, b) => a.intensity.forecast - b.intensity.forecast);
    
    const bestTime = sortedByIntensity[0];
    const worstTime = sortedByIntensity[sortedByIntensity.length - 1];
    
    const formatTime = (dateStr: string) => {
      const date = new Date(dateStr);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const isToday = date.toDateString() === today.toDateString();
      const isTomorrow = date.toDateString() === tomorrow.toDateString();
      
      const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      
      if (isToday) return `Today ${timeStr}`;
      if (isTomorrow) return `Tomorrow ${timeStr}`;
      return `${date.toLocaleDateString('en-GB', { weekday: 'short' })} ${timeStr}`;
    };

    return `📈 Best: ${formatTime(bestTime.from)} (${bestTime.intensity.forecast} gCO₂/kWh)
📉 Worst: ${formatTime(worstTime.from)} (${worstTime.intensity.forecast} gCO₂/kWh)`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Prepare context for Gemini with full 48-hour forecast
      const currentIntensity = currentData?.intensity.actual || currentData?.intensity.forecast || 0;
      const renewablePercentage = generationData
        .filter(item => ['wind', 'solar', 'hydro', 'biomass'].includes(item.fuel.toLowerCase()))
        .reduce((sum, item) => sum + item.perc, 0);

      const context = {
        currentIntensity,
        renewablePercentage,
        forecastData: forecastData.slice(0, 48), // Full 48 hours
        regionalData,
        generationData
      };

      const aiResponseText = await generateGeminiResponse(currentInput, context, userApiKey);
      
      // Generate smart suggestions based on the response
      const suggestions = generateSmartSuggestions(currentInput);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponseText,
        timestamp: new Date(),
        suggestions
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: `⚠️ I'm having trouble connecting to my AI brain right now. Please try again in a moment, or check your internet connection.`,
        timestamp: new Date(),
        suggestions: [
          "Try asking again",
          "Check current carbon intensity",
          "Show renewable energy mix"
        ]
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateSmartSuggestions = (userInput: string): string[] => {
    const input = userInput.toLowerCase();

    if (input.includes('48') || input.includes('2 days') || input.includes('tomorrow')) {
      return [
        "What about next week's forecast?",
        "Compare with last week's data",
        "Set energy reminders for best times",
        "Calculate potential savings"
      ];
    } else if (input.includes('ev') || input.includes('car') || input.includes('charge')) {
      return [
        "What about other appliances?",
        "Show me tomorrow's best times",
        "Compare charging costs by time",
        "Set charging reminders"
      ];
    } else if (input.includes('region') || input.includes('area')) {
      return [
        "Why are some regions cleaner?",
        "Show generation mix by region",
        "Best times in my area over 48h",
        "Regional forecast trends"
      ];
    } else if (input.includes('renewable') || input.includes('green') || input.includes('clean')) {
      return [
        "What affects renewable percentage?",
        "Best green energy times this week",
        "48-hour renewable trends",
        "Solar vs wind over time"
      ];
    } else if (input.includes('forecast') || input.includes('planning') || input.includes('schedule')) {
      return [
        "Set smart energy reminders",
        "Weekly energy planning",
        "Best appliance schedules",
        "Compare weekend vs weekday"
      ];
    } else if (input.includes('cost') || input.includes('save') || input.includes('money')) {
      return [
        "Calculate 48-hour savings potential",
        "Smart home automation tips",
        "Energy tariff optimization",
        "Monthly savings tracker"
      ];
    } else {
      return [
        "Plan my EV charging for 48 hours",
        "Show regional differences",
        "What's the weekend forecast?",
        "How can I save energy this week?"
      ];
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-GB';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
      };

      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Don't show the assistant if no API key is available
  if (!hasApiKey) {
    return null;
  }

  return (
    <>
      {/* AI Assistant Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group relative"
        >
          <Bot className="w-6 h-6 group-hover:animate-pulse" />
          <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
            <Sparkles className="w-3 h-3" />
          </div>
          {/* Gemini Badge */}
          <div className="absolute -bottom-1 -left-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            48h
          </div>
        </button>
      </div>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">AI Carbon Assistant</h3>
              <p className="text-sm opacity-90 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                48-Hour Forecast • Powered by Gemini
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto text-white/80 hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : message.type === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.type === 'error' && (
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Connection Error</span>
                    </div>
                  )}
                  <div className="whitespace-pre-line text-sm leading-relaxed">{message.content}</div>
                  {message.suggestions && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs opacity-70 font-medium">💡 Try asking:</div>
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`block w-full text-left text-xs rounded-lg p-2 transition-colors ${
                            message.type === 'user'
                              ? 'bg-white/20 hover:bg-white/30'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-800'
                          }`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-2xl border border-purple-200">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-600">Analyzing 48h forecast...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
                  placeholder="Ask about 48-hour forecasts, EV charging, energy timing..."
                  disabled={isTyping}
                  className="w-full p-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                    isListening ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              48-Hour Forecast Analysis • Powered by Google Gemini AI
            </div>
          </div>
        </div>
      )}
    </>
  );
}