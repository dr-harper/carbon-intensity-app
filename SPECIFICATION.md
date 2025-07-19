# UK Carbon Intensity Dashboard - Technical Specification

## 📋 Project Overview

The UK Carbon Intensity Dashboard is a real-time web application that displays carbon intensity data for the UK electricity grid. It provides users with live data, forecasts, regional comparisons, and AI-powered energy recommendations to help optimize electricity usage for environmental and cost benefits.

## 🎯 Core Features

### 1. Real-Time Carbon Intensity Monitoring
- **Live Data Display**: Current carbon intensity in gCO₂/kWh
- **Status Indicators**: Visual indicators for intensity levels (Very Low, Low, Moderate, High, Very High)
- **Data Source**: National Grid ESO Carbon Intensity API
- **Update Frequency**: Every 30 minutes (automatic refresh)

### 2. 48-Hour Forecast Visualization
- **Interactive Line Chart**: SVG-based chart showing 48-hour carbon intensity trends
- **Zero-Based Scaling**: Chart always starts from 0 for accurate data representation
- **Current Hour Highlighting**: Animated indicator showing current time
- **Hover Tooltips**: Detailed information on hover
- **Best/Worst Times**: Identification of optimal and poor energy usage periods

### 3. Regional Carbon Intensity Map
- **14 UK Regions**: Complete coverage of UK distribution network regions
- **Ranking System**: Visual ranking from cleanest to highest intensity
- **Interactive Cards**: Hover effects and detailed regional information
- **Comparative Analysis**: Above/below average indicators
- **Color-Coded Display**: Green (clean), Red (high intensity), Blue (moderate)

### 4. Generation Mix Breakdown
- **Technology Breakdown**: Real-time display of all energy sources
- **Visual Categories**: Renewable, Low Carbon, Fossil Fuels
- **Interactive Bars**: Progress bars with hover effects
- **Environmental Impact**: Summary of current grid cleanliness
- **Technology Icons**: Visual representation of each energy source

### 5. AI-Powered Assistant
- **Google Gemini Integration**: Advanced AI recommendations
- **48-Hour Analysis**: Comprehensive forecast analysis
- **Personalized Advice**: EV charging, appliance timing, energy savings
- **Voice Input**: Speech recognition for hands-free interaction
- **Smart Suggestions**: Context-aware follow-up questions

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)

### API Integration
- **Primary API**: Carbon Intensity API (https://api.carbonintensity.org.uk)
- **AI Service**: Google Gemini API
- **Data Refresh**: 30-minute intervals
- **Error Handling**: Graceful fallbacks and retry logic

### Data Flow
```
Carbon Intensity API → App.tsx → Components → UI Display
                                ↓
                        AI Assistant → Gemini API → Recommendations
```

## 📊 Data Sources & Endpoints

### Carbon Intensity API Endpoints
1. **Current Intensity**: `/intensity`
2. **48-Hour Forecast**: `/intensity/{from}/{to}` or `/intensity/date`
3. **Regional Data**: `/regional`
4. **Generation Mix**: `/generation`

### Data Structures
```typescript
interface CarbonIntensity {
  from: string;
  to: string;
  intensity: {
    forecast: number;
    actual?: number;
    index: string;
  };
}

interface RegionalData {
  regionid: number;
  dnoregion: string;
  shortname: string;
  intensity: {
    forecast: number;
    index: string;
  };
}

interface GenerationMix {
  fuel: string;
  perc: number;
}
```

## 🎨 UI/UX Design

### Design System
- **Color Palette**: 
  - Primary: Blue gradient (#3B82F6 to #1E40AF)
  - Success: Green (#10B981)
  - Warning: Orange (#F59E0B)
  - Error: Red (#EF4444)
  - Neutral: Gray scale

- **Typography**: System fonts with 3 weights maximum
- **Spacing**: 8px grid system
- **Animations**: Subtle hover effects and transitions

### Component Layout
1. **Header**: Hero section with current intensity and status
2. **Dashboard Grid**: 2-column layout (forecast + generation mix)
3. **Regional Map**: Full-width regional comparison
4. **AI Assistant**: Floating chat interface
5. **Footer**: Data attribution and links

### Responsive Design
- **Mobile**: Single column layout
- **Tablet**: Adjusted grid layouts
- **Desktop**: Full multi-column experience

## 🤖 AI Assistant Features

### Capabilities
- **48-Hour Forecast Analysis**: Complete trend analysis
- **EV Charging Optimization**: Best times for electric vehicle charging
- **Appliance Scheduling**: Optimal timing for high-energy appliances
- **Regional Comparisons**: Cross-region analysis and recommendations
- **Cost Savings**: Energy bill optimization advice
- **Environmental Impact**: Carbon footprint reduction tips

### User Interactions
- **Text Input**: Standard chat interface
- **Voice Input**: Speech-to-text functionality
- **Quick Suggestions**: Pre-defined common questions
- **Context Awareness**: Remembers conversation context

### API Key Management
- **Environment Variable**: `VITE_GEMINI_API_KEY`
- **User Input**: Browser-stored API key option
- **Security**: Keys stored locally, never sent to servers
- **Validation**: Basic API key format checking

## 🔧 Component Architecture

### Core Components

#### 1. App.tsx
- **Main Container**: Root component managing all state
- **Data Fetching**: Coordinates all API calls
- **State Management**: Manages loading states and data
- **API Key Handling**: Gemini API key management

#### 2. Header.tsx
- **Hero Display**: Current intensity and status
- **Loading States**: Skeleton loading animations
- **Status Indicators**: Visual intensity level display

#### 3. IntensityChart.tsx
- **SVG Line Chart**: 48-hour forecast visualization
- **Interactive Elements**: Hover tooltips and current hour highlighting
- **Responsive Design**: Scales across device sizes
- **Data Processing**: Chart scaling and point generation

#### 4. GenerationMix.tsx
- **Technology Breakdown**: All energy source display
- **Progress Bars**: Visual percentage representation
- **Category Summaries**: Renewable/fossil fuel totals
- **Environmental Impact**: Grid cleanliness assessment

#### 5. RegionalMap.tsx
- **Regional Cards**: Interactive region display
- **Ranking System**: Best to worst intensity ordering
- **Comparative Analysis**: Above/below average indicators
- **Summary Statistics**: UK average and extremes

#### 6. AIAssistant.tsx
- **Chat Interface**: Message display and input
- **Voice Recognition**: Speech-to-text integration
- **Smart Suggestions**: Context-aware recommendations
- **Gemini Integration**: AI response generation

#### 7. Footer.tsx
- **Attribution**: Data source credits
- **Links**: External resource links

### Utility Modules

#### 1. api.ts
- **API Functions**: All Carbon Intensity API calls
- **Error Handling**: Graceful failure management
- **Data Processing**: Response formatting
- **Intensity Levels**: Carbon intensity categorization

#### 2. gemini.ts
- **AI Integration**: Google Gemini API communication
- **Context Building**: 48-hour data analysis
- **Response Processing**: AI response formatting
- **Fallback Handling**: Offline mode responses

## 🚀 Deployment & Environment

### Environment Variables
```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Build Process
```bash
npm install
npm run build
npm run preview
```

### Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "lucide-react": "^0.344.0",
  "tailwindcss": "^3.4.1",
  "typescript": "^5.5.3",
  "vite": "^5.4.2"
}
```

## 📱 Browser Support

### Required Features
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript**: ES2020 support
- **APIs**: Fetch API, Local Storage
- **Optional**: Speech Recognition API (for voice input)

### Progressive Enhancement
- **Core Functionality**: Works without AI features
- **Voice Input**: Graceful fallback to text input
- **Animations**: Reduced motion support

## 🔒 Security & Privacy

### Data Handling
- **No Personal Data**: No user data collection
- **API Keys**: Stored locally in browser
- **External APIs**: Only Carbon Intensity and Gemini APIs
- **HTTPS**: All API calls over secure connections

### API Key Security
- **Local Storage**: Keys never leave user's browser
- **No Server Storage**: No backend key storage
- **User Control**: Users can add/remove keys anytime

## 📈 Performance Considerations

### Optimization Strategies
- **Data Caching**: 30-minute refresh intervals
- **Lazy Loading**: Components load as needed
- **SVG Charts**: Lightweight vector graphics
- **Minimal Dependencies**: Small bundle size

### Loading States
- **Skeleton Screens**: Smooth loading experience
- **Progressive Loading**: Components load independently
- **Error Boundaries**: Graceful error handling

## 🧪 Testing Strategy

### Recommended Testing
1. **Unit Tests**: Component functionality
2. **Integration Tests**: API integration
3. **E2E Tests**: User workflows
4. **Performance Tests**: Load time optimization
5. **Accessibility Tests**: WCAG compliance

### Test Scenarios
- **Data Loading**: API response handling
- **Error States**: Network failures
- **User Interactions**: Chart interactions, AI chat
- **Responsive Design**: Multiple screen sizes

## 🔄 Maintenance & Updates

### Regular Maintenance
- **Dependency Updates**: Monthly security updates
- **API Monitoring**: Carbon Intensity API status
- **Performance Monitoring**: Core Web Vitals
- **User Feedback**: Feature requests and bug reports

### Future Enhancements
- **Notifications**: Browser notifications for optimal times
- **Export Features**: Data export capabilities
- **Advanced Analytics**: Detailed energy insights

### Recently Added
- **Historical Data**: Past 24-hour carbon intensity trends

## 📞 Support & Documentation

### Resources
- **Carbon Intensity API**: https://carbonintensity.org.uk/
- **Google Gemini API**: https://aistudio.google.com/
- **React Documentation**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/

### Contact Information
- **API Issues**: Carbon Intensity API support
- **AI Features**: Google AI Studio documentation
- **Technical Issues**: Check browser console for errors

---

## 🎯 Success Metrics

### User Experience
- **Load Time**: < 3 seconds initial load
- **Interactivity**: < 100ms response times
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile Experience**: Fully responsive design

### Data Accuracy
- **Real-time Updates**: 30-minute refresh cycle
- **API Reliability**: 99%+ uptime dependency
- **Data Validation**: Error handling for malformed data

This specification provides a complete overview of the UK Carbon Intensity Dashboard, enabling any developer to understand, maintain, and extend the application effectively.