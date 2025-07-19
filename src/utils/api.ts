const BASE_URL = 'https://api.carbonintensity.org.uk';

export async function getCurrentIntensity() {
  try {
    const response = await fetch(`${BASE_URL}/intensity`);
    if (!response.ok) throw new Error('Failed to fetch current intensity');
    return await response.json();
  } catch (error) {
    console.error('Error fetching current intensity:', error);
    return null;
  }
}

export async function getIntensityForecast(hours = 48) {
  try {
    // Get current date and calculate end date for the forecast period
    const now = new Date();
    const endDate = new Date(now.getTime() + (hours * 60 * 60 * 1000));
    
    // Format dates for the API (ISO format)
    const fromDate = now.toISOString().split('.')[0] + 'Z';
    const toDate = endDate.toISOString().split('.')[0] + 'Z';
    
    // Use the date range endpoint for more precise control
    const response = await fetch(`${BASE_URL}/intensity/${fromDate}/${toDate}`);
    if (!response.ok) {
      // Fallback to the general date endpoint if the specific range fails
      const fallbackResponse = await fetch(`${BASE_URL}/intensity/date`);
      if (!fallbackResponse.ok) throw new Error('Failed to fetch forecast');
      return await fallbackResponse.json();
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return null;
  }
}

export async function getRegionalData() {
  try {
    const response = await fetch(`${BASE_URL}/regional`);
    if (!response.ok) throw new Error('Failed to fetch regional data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching regional data:', error);
    return null;
  }
}

export async function getGenerationMix() {
  try {
    const response = await fetch(`${BASE_URL}/generation`);
    if (!response.ok) throw new Error('Failed to fetch generation mix');
    return await response.json();
  } catch (error) {
    console.error('Error fetching generation mix:', error);
    return null;
  }
}

export function getIntensityLevel(intensity: number) {
  if (intensity < 100) return { level: 'Very Low', color: 'text-green-600', bgColor: 'bg-green-100', description: 'Excellent time to use electricity' };
  if (intensity < 200) return { level: 'Low', color: 'text-emerald-600', bgColor: 'bg-emerald-100', description: 'Good time to use electricity' };
  if (intensity < 300) return { level: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-100', description: 'Average carbon intensity' };
  if (intensity < 400) return { level: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100', description: 'Consider reducing usage' };
  return { level: 'Very High', color: 'text-red-600', bgColor: 'bg-red-100', description: 'Avoid high energy usage' };
}