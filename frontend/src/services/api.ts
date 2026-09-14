import type { FullAssessmentResult, GISLayers, SensorStation } from '../types';

const API_BASE = '';

export async function fetchLatestSensors(): Promise<SensorStation[]> {
  const res = await fetch(`${API_BASE}/api/v1/telemetry/latest`);
  if (!res.ok) throw new Error('Failed to fetch sensor telemetry');
  const data = await res.json();
  return data.sensors;
}

export async function fetchGISLayers(): Promise<GISLayers> {
  const res = await fetch(`${API_BASE}/api/v1/gis/layers`);
  if (!res.ok) throw new Error('Failed to fetch GIS layers');
  return res.json();
}

export async function fetchFullAssessment(params: {
  slope_angle_deg: number;
  soil_moisture_pct: number;
  rainfall_rate_mm_hr: number;
  cumulative_rain_24h_mm: number;
  upstream_water_depth_m: number;
  pore_pressure_kpa: number;
}): Promise<FullAssessmentResult> {
  const res = await fetch(`${API_BASE}/api/v1/predict/full-assessment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to evaluate risk assessment');
  return res.json();
}

export async function triggerCloudburst(intensity: number = 0.8): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/api/v1/simulate/spike?intensity=${intensity}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to trigger simulation spike');
  return res.json();
}

export async function fetchInfrastructureStatus(params: {
  rainfall_rate_mm_hr: number;
  upstream_water_depth_m: number;
  soil_moisture_pct: number;
}): Promise<any> {
  const query = new URLSearchParams({
    rainfall_rate_mm_hr: params.rainfall_rate_mm_hr.toString(),
    upstream_water_depth_m: params.upstream_water_depth_m.toString(),
    soil_moisture_pct: params.soil_moisture_pct.toString(),
  });
  const res = await fetch(`${API_BASE}/api/v1/predict/infrastructure-status?${query}`);
  if (!res.ok) throw new Error('Failed to fetch infrastructure status');
  return res.json();
}

export async function fetchMathValidation(params: {
  rainfall_rate_mm_hr: number;
  slope_angle_deg: number;
  upstream_water_depth_m: number;
}): Promise<any> {
  const query = new URLSearchParams({
    rainfall_rate_mm_hr: params.rainfall_rate_mm_hr.toString(),
    slope_angle_deg: params.slope_angle_deg.toString(),
    upstream_water_depth_m: params.upstream_water_depth_m.toString(),
  });
  const res = await fetch(`${API_BASE}/api/v1/predict/math-validation?${query}`);
  if (!res.ok) throw new Error('Failed to fetch math validation');
  return res.json();
}

export function createTelemetryWebSocket(
  onMessage: (reading: any) => void,
  onError?: (err: Event) => void
): WebSocket {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;
  const ws = new WebSocket(wsUrl);
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error('Error parsing WS message', e);
    }
  };
  if (onError) ws.onerror = onError;
  return ws;
}
