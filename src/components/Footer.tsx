import React from 'react';
import { Activity, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <Activity className="w-6 h-6" />
            <span className="text-xl font-bold">UK Carbon Intensity</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <a 
              href="https://carbonintensity.org.uk/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
            >
              Data Source <ExternalLink className="w-4 h-4" />
            </a>
            <span className="text-gray-400">Updated every 30 minutes</span>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>This dashboard displays real-time carbon intensity data for the UK electricity grid.</p>
          <p className="mt-2">Data provided by National Grid ESO via the Carbon Intensity API.</p>
        </div>
      </div>
    </footer>
  );
}