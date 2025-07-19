import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { PathOptions } from 'leaflet';
import type { FeatureCollection, Feature } from 'geojson';
import { RegionalData } from '../types/carbon';
import { getIntensityLevel } from '../utils/api';

interface RegionalMapViewProps {
  regionalData: RegionalData[];
  isLoading: boolean;
}

export default function RegionalMapView({ regionalData, isLoading }: RegionalMapViewProps) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch('/dno_regions.geojson')
      .then((res) => res.json())
      .then(setGeoData)
      .catch((err) => console.error('Failed to load GeoJSON', err));
  }, []);

  const styleFeature = (feature: Feature) => {
    const region = regionalData.find((r) => r.dnoregion === feature.properties.dnoregion);
    const intensity = region?.intensity.forecast ?? 0;
    const level = getIntensityLevel(intensity);
    let fill = '#dc2626';
    switch (level.level) {
      case 'Very Low':
        fill = '#16a34a';
        break;
      case 'Low':
        fill = '#059669';
        break;
      case 'Moderate':
        fill = '#ca8a04';
        break;
      case 'High':
        fill = '#ea580c';
        break;
      default:
        fill = '#dc2626';
    }
    return {
      fillColor: fill,
      weight: 1,
      color: '#666',
      fillOpacity: 0.6
    } as PathOptions;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">Loading map...</div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <MapContainer center={[54, -2]} zoom={5} style={{ height: '500px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {geoData && <GeoJSON data={geoData as FeatureCollection} style={styleFeature} />}
      </MapContainer>
    </div>
  );
}
