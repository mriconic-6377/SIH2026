export interface SensorReading {
  water_level_m: number | null;
  soil_moisture_pct: number | null;
  pore_pressure_kpa: number | null;
  rainfall_mm_hr: number | null;
  battery_v: number | null;
  recorded_at: string | null;
}

export interface SensorStation {
  sensor_id: string;
  name: string;
  type: 'RIVER_STAGE' | 'SOIL_MOISTURE' | 'RAIN_GAUGE';
  lat: number;
  lon: number;
  elevation: number;
  status: string;
  latest: SensorReading | null;
}

export interface Habitation {
  habitation_id: string;
  name: string;
  district: string;
  population: number;
  elderly_ratio: number;
  kutcha_ratio: number;
  elevation: number;
  nearest_shelter: string | null;
  lat: number;
  lon: number;
}

export interface Bridge {
  bridge_id: string;
  name: string;
  highway: string;
  deck_elevation: number;
  span: number;
  is_submerged: boolean;
  lat: number;
  lon: number;
}

export interface Shelter {
  shelter_id: string;
  name: string;
  type: string;
  capacity: number;
  elevation: number;
  road_access: boolean;
  water_supply: boolean;
  lat: number;
  lon: number;
}

export interface SlopeStabilityResult {
  factor_of_safety: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  slope_angle_deg: number;
  water_table_ratio: number;
  soil_type: string;
  interpretation: string;
}

export interface HabitationLeadTime {
  habitation_name: string;
  distance_km: number;
  upstream_water_depth_m: number;
  wave_speed_m_per_s: number;
  raw_travel_time_mins: number;
  processing_delay_mins: number;
  net_lead_time_mins: number;
  urgency: 'ADEQUATE' | 'TIGHT' | 'INSUFFICIENT';
}

export interface LeadTimeReport {
  basin_id: string;
  surge_wave_speed_m_s: number;
  discharge_m3_s: number;
  overall_urgency: string;
  habitations: HabitationLeadTime[];
}

export interface ExplainabilityResult {
  overall_risk_score: number;
  risk_level: string;
  feature_contributions: Record<string, number>;
  top_driver: string;
  interpretation: string;
}

export interface FullAssessmentResult {
  overall_risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  slope_stability: SlopeStabilityResult;
  lead_time: LeadTimeReport;
  explainability: ExplainabilityResult;
}

export interface GISLayers {
  sensors: any;
  habitations: any;
  bridges: any;
  shelters: any;
  hazard_zones: any;
}

export interface VillageStatus {
  id: string;
  name: string;
  district: string;
  population: number;
  vulnerable_count: number;
  kutcha_houses_count: number;
  elevation_m: number;
  slope_angle_deg: number;
  factor_of_safety: number;
  inundation_risk_pct: number;
  freeboard_margin_m: number;
  lead_time_mins: number;
  distance_km?: number;
  status: 'EVACUATE_NOW' | 'HIGH_ALERT' | 'MONITORING' | 'SAFE';
  status_label: string;
  status_color: string;
  nearest_shelter: string;
  advisory: string;
}

export interface BridgeStatus {
  id: string;
  name: string;
  highway: string;
  span_m: number;
  deck_elevation_m: number;
  freeboard_clearance_m: number;
  scour_velocity_m_s: number;
  pier_hydrodynamic_thrust_kn: number;
  submergence_risk_pct: number;
  status: 'SUBMERGED_CLOSED' | 'CRITICAL_SCOUR_WARNING' | 'CAUTION_MONITORING' | 'OPERATIONAL_OPEN';
  status_label: string;
  status_color: string;
  traffic_action: string;
  choke_point_importance: string;
}

export interface InfrastructureStatusReport {
  timestamp: string;
  inputs: {
    rainfall_rate_mm_hr: number;
    upstream_water_depth_m: number;
    soil_moisture_pct: number;
    discharge_m3_s: number;
    surge_wave_speed_m_s: number;
  };
  habitations: VillageStatus[];
  bridges: BridgeStatus[];
}

