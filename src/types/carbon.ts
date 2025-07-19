export interface CarbonIntensity {
  from: string;
  to: string;
  intensity: {
    forecast: number;
    actual?: number;
    index: string;
  };
}

export interface RegionalData {
  regionid: number;
  dnoregion: string;
  shortname: string;
  intensity: {
    forecast: number;
    index: string;
  };
  generationmix: GenerationMix[];
}

export interface GenerationMix {
  fuel: string;
  perc: number;
}

export interface CarbonResponse {
  data: CarbonIntensity[];
}

export interface RegionalResponse {
  data: {
    from: string;
    to: string;
    regions: RegionalData[];
  }[];
}

export interface IntensityLevel {
  level: string;
  color: string;
  bgColor: string;
  description: string;
}