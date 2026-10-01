export interface Entity {
  text: string;
  type: string;
  start: number;
  end: number;
  confidence: number;
  method: string;
  evidence?: string;
}

export interface AnalysisItem {
  _id?: string;
  id?: string;
  inputText: string;
  summary?: string;
  source?: { name: string; category: string; confidence: number };
  pollutants?: Array<{ name: string; confidence: number; evidence?: string }>;
  locations?: Array<{ name: string; confidence: number; evidence?: string }>;
  pollutionCategory?: string;
  severity?: { label: string; confidence?: number; matched_indicator?: string };
  entities?: Entity[];
  relationships?: Array<{ source: string; pollutant: string; location: string; relationship?: string; confidence?: number }>;
  confidence?: Record<string, number>;
  processingTimeMs?: number;
  createdAt?: string;
  isDemo?: boolean;
}

export interface AnalysisResult {
  input_text: string;
  summary: string;
  pollution_category: string;
  category_confidence: number;
  category_method: string;
  source: { name: string; category: string; confidence: number };
  pollutants: Array<{ name: string; confidence: number; evidence?: string }>;
  locations: Array<{ name: string; confidence: number; evidence?: string }>;
  severity: { label: string; matched_indicator?: string };
  entities?: Entity[];
  relationships?: Array<{ source: string; pollutant: string; location: string }>;
  confidence_summary?: Record<string, number>;
  processing_time_ms: number;
}

export interface DashboardDatum {
  name: string;
  value?: number;
  count?: number;
}

export interface DashboardStats {
  totalAnalyses: number;
  databaseType: string;
  categoryDistribution: DashboardDatum[];
  sourceCategoryDistribution: DashboardDatum[];
  topPollutants: DashboardDatum[];
  topLocations: DashboardDatum[];
  severityDistribution: DashboardDatum[];
  analysesOverTime: DashboardDatum[];
}
