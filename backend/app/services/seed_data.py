"""
GeoResilience AI — Beas River Valley Seed Data

Pre-loads realistic sensor stations, habitations, bridges, and shelters
for the Mandi-Kullu stretch of the Beas River (Himachal Pradesh).

All coordinates are real geographic locations along NH-21 / NH-154.
"""

from app.core.database import SessionLocal
from app.models.spatial_models import Sensor, Habitation, Bridge, Shelter


def seed_beas_valley_data():
    """Insert pilot region seed data if tables are empty."""
    db = SessionLocal()

    try:
        # Skip if already seeded
        if db.query(Sensor).count() > 0:
            print("[SEED] Data already exists. Skipping seed.")
            return

        # ─────────────── Sensor Stations (Beas River Stretch) ───────────────

        sensors = [
            Sensor(sensor_id="SN-KULLU-001", name="Kullu Upstream Gauge", sensor_type="RIVER_STAGE",
                   basin_id="BEAS-KULLU", elevation_meters=1220, latitude=31.9580, longitude=77.1025, status="ACTIVE"),
            Sensor(sensor_id="SN-BHUNTAR-002", name="Bhuntar Bridge Gauge", sensor_type="RIVER_STAGE",
                   basin_id="BEAS-KULLU", elevation_meters=1096, latitude=31.8780, longitude=77.1490, status="ACTIVE"),
            Sensor(sensor_id="SN-LARJI-003", name="Larji Dam Tailrace", sensor_type="RIVER_STAGE",
                   basin_id="BEAS-MANDI", elevation_meters=900, latitude=31.8050, longitude=77.1940, status="ACTIVE"),
            Sensor(sensor_id="SN-AUT-004", name="Aut Tunnel Entry Gauge", sensor_type="RIVER_STAGE",
                   basin_id="BEAS-MANDI", elevation_meters=850, latitude=31.7820, longitude=77.2150, status="ACTIVE"),
            Sensor(sensor_id="SN-PANDOH-005", name="Pandoh Dam Sensor", sensor_type="RIVER_STAGE",
                   basin_id="BEAS-MANDI", elevation_meters=780, latitude=31.6690, longitude=77.0550, status="ACTIVE"),
            Sensor(sensor_id="SN-MANDI-006", name="Mandi Town Gauge", sensor_type="RIVER_STAGE",
                   basin_id="BEAS-MANDI", elevation_meters=710, latitude=31.7152, longitude=76.9320, status="ACTIVE"),
            Sensor(sensor_id="SN-SLOPE-007", name="Larji Slope Soil Moisture", sensor_type="SOIL_MOISTURE",
                   basin_id="BEAS-MANDI", elevation_meters=1050, latitude=31.8100, longitude=77.1880, status="ACTIVE"),
            Sensor(sensor_id="SN-SLOPE-008", name="Aut Valley Piezometer", sensor_type="SOIL_MOISTURE",
                   basin_id="BEAS-MANDI", elevation_meters=950, latitude=31.7900, longitude=77.2050, status="ACTIVE"),
        ]

        # ─────────────── Vulnerable Habitations ───────────────

        habitations = [
            Habitation(habitation_id="HAB-AUT", name="Aut", district="Mandi", state="Himachal Pradesh",
                       total_population=2800, elderly_children_ratio=0.28, kutcha_house_ratio=0.35,
                       latitude=31.7820, longitude=77.2150, elevation_meters=850, nearest_shelter_id="SHL-AUT-SCHOOL"),
            Habitation(habitation_id="HAB-PANDOH", name="Pandoh", district="Mandi", state="Himachal Pradesh",
                       total_population=3500, elderly_children_ratio=0.22, kutcha_house_ratio=0.30,
                       latitude=31.6690, longitude=77.0550, elevation_meters=780, nearest_shelter_id="SHL-PANDOH-HALL"),
            Habitation(habitation_id="HAB-THALOT", name="Thalot", district="Mandi", state="Himachal Pradesh",
                       total_population=1200, elderly_children_ratio=0.32, kutcha_house_ratio=0.55,
                       latitude=31.7300, longitude=77.1200, elevation_meters=750, nearest_shelter_id="SHL-PANDOH-HALL"),
            Habitation(habitation_id="HAB-MANDI", name="Mandi Town", district="Mandi", state="Himachal Pradesh",
                       total_population=26422, elderly_children_ratio=0.20, kutcha_house_ratio=0.15,
                       latitude=31.7152, longitude=76.9320, elevation_meters=710, nearest_shelter_id="SHL-MANDI-CENTER"),
            Habitation(habitation_id="HAB-LARJI", name="Larji", district="Mandi", state="Himachal Pradesh",
                       total_population=1800, elderly_children_ratio=0.30, kutcha_house_ratio=0.45,
                       latitude=31.8050, longitude=77.1940, elevation_meters=900, nearest_shelter_id="SHL-AUT-SCHOOL"),
            Habitation(habitation_id="HAB-BHUNTAR", name="Bhuntar", district="Kullu", state="Himachal Pradesh",
                       total_population=8500, elderly_children_ratio=0.24, kutcha_house_ratio=0.20,
                       latitude=31.8780, longitude=77.1490, elevation_meters=1096, nearest_shelter_id="SHL-BHUNTAR-AIRPORT"),
        ]

        # ─────────────── Critical Bridges ───────────────

        bridges = [
            Bridge(bridge_id="BR-BHUNTAR-01", name="Bhuntar Beas Bridge", highway="NH-21",
                   latitude=31.8770, longitude=77.1500, deck_elevation_meters=1100, span_meters=65),
            Bridge(bridge_id="BR-LARJI-02", name="Larji Dam Access Bridge", highway="NH-21",
                   latitude=31.8060, longitude=77.1950, deck_elevation_meters=905, span_meters=45),
            Bridge(bridge_id="BR-AUT-03", name="Aut Tunnel Approach Bridge", highway="NH-21",
                   latitude=31.7830, longitude=77.2140, deck_elevation_meters=855, span_meters=40),
            Bridge(bridge_id="BR-PANDOH-04", name="Pandoh Lake Crossing", highway="NH-21",
                   latitude=31.6700, longitude=77.0560, deck_elevation_meters=785, span_meters=70),
        ]

        # ─────────────── Safe Shelters / Green Zones ───────────────

        shelters = [
            Shelter(shelter_id="SHL-AUT-SCHOOL", name="Aut Government High School", shelter_type="SCHOOL",
                    latitude=31.7840, longitude=77.2180, elevation_meters=920, capacity_persons=400),
            Shelter(shelter_id="SHL-PANDOH-HALL", name="Pandoh Community Center", shelter_type="COMMUNITY_HALL",
                    latitude=31.6710, longitude=77.0580, elevation_meters=830, capacity_persons=600),
            Shelter(shelter_id="SHL-MANDI-CENTER", name="Mandi District Relief Hub", shelter_type="COMMUNITY_HALL",
                    latitude=31.7180, longitude=76.9350, elevation_meters=760, capacity_persons=1200),
            Shelter(shelter_id="SHL-BHUNTAR-AIRPORT", name="Bhuntar Airport Staging Area", shelter_type="HELIPAD",
                    latitude=31.8760, longitude=77.1540, elevation_meters=1110, capacity_persons=800),
        ]

        db.add_all(sensors + habitations + bridges + shelters)
        db.commit()
        print(f"[SEED] OK - Seeded {len(sensors)} sensors, {len(habitations)} habitations, "
              f"{len(bridges)} bridges, {len(shelters)} shelters.")

    except Exception as e:
        db.rollback()
        print(f"[SEED] ERROR - Error seeding data: {e}")
    finally:
        db.close()
