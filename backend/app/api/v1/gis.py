"""
GeoResilience AI — GIS Spatial Data API

Endpoints:
  GET  /api/v1/gis/sensors       — All sensor stations as GeoJSON
  GET  /api/v1/gis/habitations   — All vulnerable habitations as GeoJSON
  GET  /api/v1/gis/bridges       — Critical bridges as GeoJSON
  GET  /api/v1/gis/shelters      — Safe relocation shelters as GeoJSON
  GET  /api/v1/gis/hazard-zones  — Active hazard zones as GeoJSON
  GET  /api/v1/gis/layers        — All layers combined for map initialization
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.spatial_models import Sensor, Habitation, Bridge, Shelter, HazardZone

router = APIRouter(prefix="/api/v1/gis", tags=["GIS Layers"])


def _to_geojson_feature(entity, properties: dict) -> dict:
    """Convert a database entity with lat/lon into a GeoJSON Feature."""
    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [entity.longitude, entity.latitude],
        },
        "properties": properties,
    }


@router.get("/sensors")
def get_sensors_geojson(db: Session = Depends(get_db)):
    """Return all sensor stations as a GeoJSON FeatureCollection."""
    sensors = db.query(Sensor).all()
    features = [
        _to_geojson_feature(s, {
            "id": s.sensor_id, "name": s.name, "type": s.sensor_type,
            "basin": s.basin_id, "elevation": s.elevation_meters, "status": s.status,
        })
        for s in sensors
    ]
    return {"type": "FeatureCollection", "features": features}


@router.get("/habitations")
def get_habitations_geojson(db: Session = Depends(get_db)):
    """Return all vulnerable habitations as GeoJSON."""
    habs = db.query(Habitation).all()
    features = [
        _to_geojson_feature(h, {
            "id": h.habitation_id, "name": h.name, "district": h.district,
            "population": h.total_population, "elderly_ratio": h.elderly_children_ratio,
            "kutcha_ratio": h.kutcha_house_ratio, "elevation": h.elevation_meters,
            "nearest_shelter": h.nearest_shelter_id,
        })
        for h in habs
    ]
    return {"type": "FeatureCollection", "features": features}


@router.get("/bridges")
def get_bridges_geojson(db: Session = Depends(get_db)):
    """Return all critical highway bridges as GeoJSON."""
    bridges = db.query(Bridge).all()
    features = [
        _to_geojson_feature(b, {
            "id": b.bridge_id, "name": b.name, "highway": b.highway,
            "deck_elevation": b.deck_elevation_meters, "span": b.span_meters,
            "is_submerged": b.is_submerged,
        })
        for b in bridges
    ]
    return {"type": "FeatureCollection", "features": features}


@router.get("/shelters")
def get_shelters_geojson(db: Session = Depends(get_db)):
    """Return all safe relocation shelters as GeoJSON."""
    shelters = db.query(Shelter).all()
    features = [
        _to_geojson_feature(s, {
            "id": s.shelter_id, "name": s.name, "type": s.shelter_type,
            "capacity": s.capacity_persons, "elevation": s.elevation_meters,
            "road_access": s.has_road_access, "water_supply": s.has_water_supply,
        })
        for s in shelters
    ]
    return {"type": "FeatureCollection", "features": features}


@router.get("/hazard-zones")
def get_hazard_zones_geojson(db: Session = Depends(get_db)):
    """Return all active hazard zones as GeoJSON circles."""
    zones = db.query(HazardZone).filter(HazardZone.is_active == True).all()
    features = [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [z.center_lon, z.center_lat],
            },
            "properties": {
                "zone_id": z.zone_id, "hazard_type": z.hazard_type,
                "risk_level": z.risk_level, "probability": z.risk_probability,
                "fos": z.factor_of_safety, "flood_depth_m": z.flood_depth_estimated_m,
                "lead_time_mins": z.evacuation_lead_time_mins,
                "radius_km": z.radius_km,
            },
        }
        for z in zones
    ]
    return {"type": "FeatureCollection", "features": features}


@router.get("/layers")
def get_all_layers(db: Session = Depends(get_db)):
    """Return all GIS layers combined for initial map bootstrapping."""
    return {
        "sensors": get_sensors_geojson(db),
        "habitations": get_habitations_geojson(db),
        "bridges": get_bridges_geojson(db),
        "shelters": get_shelters_geojson(db),
        "hazard_zones": get_hazard_zones_geojson(db),
    }


# ─────────────── Cartosat-1 DEM Terrain Endpoints ───────────────

@router.get("/dem/catalog")
def get_dem_catalog():
    """Return catalog of all loaded ISRO Bhuvan / Cartosat-1 DEM tiles."""
    from app.services.dem_raster_service import get_dem_catalog_status
    return get_dem_catalog_status()


@router.get("/dem/elevation-profile")
def get_elevation_profile():
    """Return longitudinal elevation & slope transect along Beas River channel."""
    from app.services.dem_raster_service import get_beas_valley_elevation_profile
    return {
        "transect_name": "Beas River Longitudinal Gorge Profile (Kullu to Mandi)",
        "total_checkpoints": len(get_beas_valley_elevation_profile()),
        "profile": get_beas_valley_elevation_profile(),
    }


@router.get("/dem/sample-point")
def sample_dem_point(lat: float, lon: float):
    """Sample exact elevation (m) and slope (deg) from Cartosat-1 DEM at any point."""
    from app.services.dem_raster_service import get_slope_at_coord
    elev, slope = get_slope_at_coord(lat, lon)
    return {
        "latitude": lat,
        "longitude": lon,
        "elevation_m": elev,
        "slope_degrees": slope,
        "dem_source": "ISRO Cartosat-1 DEM v3 (30m)",
    }
