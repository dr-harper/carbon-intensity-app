const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export async function generateGeminiResponse(
  userMessage: string,
  context: {
    currentIntensity: number;
    renewablePercentage: number;
    forecastData: any[];
    regionalData: any[];
    generationData: any[];
  },
  userApiKey?: string | null
): Promise<string> {
  // Get API key from environment or user input
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || userApiKey;
  
  // Check if API key is available
  if (!apiKey) {
    return `🤖 AI Assistant is not configured. Please add your Gemini API key to use the AI features.

Based on the current data:
- Carbon intensity: ${context.currentIntensity} gCO₂/kWh
- Renewable energy: ${context.renewablePercentage.toFixed(1)}%

${context.currentIntensity < 200 
  ? '🌱 Great time to use electricity - low carbon intensity!' 
  : context.currentIntensity < 300 
  ? '⚡ Moderate carbon intensity - consider timing energy usage'
  : '🔥 High carbon intensity - try to reduce energy usage if possible'
}

To enable AI features, get a free API key from Google AI Studio and add it using the setup button at the top of the page.`;
  }

  // Prepare detailed forecast analysis for the next 48 hours
  const forecastAnalysis = analyzeForecastData(context.forecastData);
  
  const systemPrompt = `You are an AI Carbon Intensity Assistant for the UK electricity grid. You help users understand carbon intensity data and make smart energy decisions.

CURRENT DATA CONTEXT:
- Current carbon intensity: ${context.currentIntensity} gCO₂/kWh
- Renewable energy percentage: ${context.renewablePercentage.toFixed(1)}%
- Available forecast data for next 48 hours (${context.forecastData.length} data points)
- Regional data across UK regions
- Live generation mix data

48-HOUR FORECAST ANALYSIS:
${forecastAnalysis}

PERSONALITY & STYLE:
- Be friendly, helpful, and enthusiastic about clean energy
- Use emojis appropriately (🌱 for green energy, ⚡ for electricity, 🚗 for EVs, etc.)
- Provide specific, actionable advice with exact times when possible
- Keep responses concise but informative
- Use UK terminology and time formats (24-hour clock)

CAPABILITIES:
- Analyze 48-hour carbon intensity trends and forecasts
- Recommend optimal times for energy usage (EV charging, appliances) over the next 2 days
- Compare regional differences
- Explain renewable energy mix
- Calculate potential carbon savings over multiple days
- Provide cost-saving tips with specific timing
- Explain what affects carbon intensity patterns
- Identify the best and worst times over the next 48 hours

RESPONSE FORMAT:
- Start with a relevant emoji and brief summary
- Provide specific data points and recommendations with exact times
- Include actionable next steps when relevant
- For timing recommendations, always specify exact hours (e.g., "2:00 AM tomorrow")
- End with a helpful follow-up suggestion

TIMING RECOMMENDATIONS:
- Always provide specific times from the 48-hour forecast
- Mention both today and tomorrow's best/worst times
- Consider overnight periods for EV charging
- Account for typical usage patterns (avoid peak demand times)

Remember: Lower carbon intensity = cleaner electricity. Best times are when renewable energy is high and carbon intensity is low.`;

  const prompt = `${systemPrompt}

User Question: ${userMessage}

Please provide a helpful response based on the current UK carbon intensity data and 48-hour forecast.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error details:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Enhanced fallback response with 48-hour data
    const fallbackAnalysis = generateFallbackAnalysis(context);
    
    return `🤖 I'm having trouble connecting to my AI brain right now, but I can still help with the data! 

${fallbackAnalysis}

Try asking me again in a moment, or ask about specific topics like EV charging, appliance timing, or regional comparisons.`;
  }
}

function analyzeForecastData(forecastData: any[]): string {
  if (!forecastData || forecastData.length === 0) {
    return "No forecast data available";
  }

  // Find best and worst times over 48 hours
  const sortedByIntensity = [...forecastData].sort((a, b) => a.intensity.forecast - b.intensity.forecast);
  const bestTimes = sortedByIntensity.slice(0, 5);
  const worstTimes = sortedByIntensity.slice(-5).reverse();
  
  // Calculate averages for different periods
  const next24Hours = forecastData.slice(0, 24);
  const following24Hours = forecastData.slice(24, 48);
  
  const avg24h = next24Hours.reduce((sum, item) => sum + item.intensity.forecast, 0) / next24Hours.length;
  const avgNext24h = following24Hours.length > 0 
    ? following24Hours.reduce((sum, item) => sum + item.intensity.forecast, 0) / following24Hours.length 
    : 0;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-GB', { 
      weekday: 'short',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return `
BEST TIMES (Lowest Carbon Intensity):
${bestTimes.map(item => `- ${formatTime(item.from)}: ${item.intensity.forecast} gCO₂/kWh`).join('\n')}

WORST TIMES (Highest Carbon Intensity):
${worstTimes.map(item => `- ${formatTime(item.from)}: ${item.intensity.forecast} gCO₂/kWh`).join('\n')}

PERIOD AVERAGES:
- Next 24 hours: ${avg24h.toFixed(0)} gCO₂/kWh
- Following 24 hours: ${avgNext24h > 0 ? avgNext24h.toFixed(0) + ' gCO₂/kWh' : 'Not available'}

OVERNIGHT PERIODS (Good for EV charging):
${forecastData
  .filter(item => {
    const hour = new Date(item.from).getHours();
    return hour >= 23 || hour <= 6;
  })
  .slice(0, 8)
  .map(item => `- ${formatTime(item.from)}: ${item.intensity.forecast} gCO₂/kWh`)
  .join('\n')}`;
}

function generateFallbackAnalysis(context: any): string {
  const { currentIntensity, renewablePercentage, forecastData } = context;
  
  if (!forecastData || forecastData.length === 0) {
    return `**Current Status:**
- Carbon intensity: ${currentIntensity} gCO₂/kWh
- Renewable energy: ${renewablePercentage.toFixed(1)}%

${currentIntensity < 200 
  ? '🌱 Great time to use electricity - low carbon intensity!' 
  : currentIntensity < 300 
  ? '⚡ Moderate carbon intensity - consider timing energy usage'
  : '🔥 High carbon intensity - try to reduce energy usage if possible'
}`;
  }

  const next24Hours = forecastData.slice(0, 24);
  const minIntensity = Math.min(...next24Hours.map((d: any) => d.intensity.forecast));
  const maxIntensity = Math.max(...next24Hours.map((d: any) => d.intensity.forecast));
  
  const bestTime = next24Hours.find((d: any) => d.intensity.forecast === minIntensity);
  const worstTime = next24Hours.find((d: any) => d.intensity.forecast === maxIntensity);
  
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return `**Current Status:**
- Carbon intensity: ${currentIntensity} gCO₂/kWh  
- Renewable energy: ${renewablePercentage.toFixed(1)}%

**48-Hour Outlook:**
- Best time: ${bestTime ? formatTime(bestTime.from) : 'Unknown'} (${minIntensity} gCO₂/kWh) 🌱
- Worst time: ${worstTime ? formatTime(worstTime.from) : 'Unknown'} (${maxIntensity} gCO₂/kWh) 🔥

${currentIntensity < 200 
  ? '🌱 Great time to use electricity right now!' 
  : currentIntensity < 300 
  ? '⚡ Moderate carbon intensity - consider timing energy usage'
  : '🔥 High carbon intensity - try to reduce energy usage if possible'
}`;
}