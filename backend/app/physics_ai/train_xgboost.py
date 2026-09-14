"""
GeoResilience AI — Historical Flood & Landslide ML Model Trainer

Synthesizes a realistic 5,000-record dataset of hydro-meteorological, geotechnical,
and topographical features calibrated for the Beas River Valley (Mandi-Kullu, HP).

Features:
  - rainfall_intensity_mm_hr: Hourly rainfall rate (0 - 160 mm/hr)
  - antecedent_rain_24h_mm: 24h cumulative rainfall (0 - 300 mm)
  - antecedent_rain_72h_mm: 3-day cumulative rainfall (0 - 500 mm)
  - soil_moisture_pct: Volumetric soil saturation (10 - 100%)
  - pore_water_pressure_kpa: Subsurface pore pressure (0 - 90 kPa)
  - slope_angle_deg: Mountain terrain gradient (5 - 55 degrees)
  - topographic_wetness_index: TWI ln(a / tan beta) (3.0 - 14.0)
  - upstream_water_depth_m: River gauge stage height (0.5 - 8.5 m)
  - river_flow_velocity_m_s: Measured channel surge speed (1.0 - 9.5 m/s)

Target:
  - flood_landslide_risk_class: 0 (LOW), 1 (MODERATE), 2 (HIGH), 3 (CRITICAL)

Trains an XGBoost Classifier and saves the serialized model for production inference.
"""

import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import xgboost as xgb


def generate_synthetic_dataset(num_samples: int = 5000, random_seed: int = 42) -> tuple[np.ndarray, np.ndarray, list[str]]:
    """
    Generates realistic hydro-meteorological & geotechnical data matching
    Himalayan cloudburst and landslide trigger mechanics.
    """
    np.random.seed(random_seed)

    # 1. Generate Feature Distributions
    rainfall = np.random.exponential(scale=20.0, size=num_samples)
    rainfall = np.clip(rainfall, 0, 160)

    # Antecedent rain has strong correlation with current rainfall
    antecedent_24h = rainfall * np.random.uniform(1.2, 2.5, size=num_samples) + np.random.exponential(scale=15.0, size=num_samples)
    antecedent_24h = np.clip(antecedent_24h, 0, 300)

    antecedent_72h = antecedent_24h * np.random.uniform(1.3, 2.0, size=num_samples) + np.random.exponential(scale=25.0, size=num_samples)
    antecedent_72h = np.clip(antecedent_72h, 0, 500)

    # Soil moisture responds to 72h rainfall with asymptotic saturation
    soil_moisture = 35.0 + 60.0 * (1.0 - np.exp(-antecedent_72h / 120.0)) + np.random.normal(0, 3.0, size=num_samples)
    soil_moisture = np.clip(soil_moisture, 15.0, 100.0)

    # Pore pressure is directly driven by soil saturation
    pore_pressure = (soil_moisture / 100.0) * 70.0 + (rainfall / 160.0) * 20.0 + np.random.normal(0, 2.0, size=num_samples)
    pore_pressure = np.clip(pore_pressure, 0, 90.0)

    # Topographical features (Mandi-Kullu terrain)
    slope_angle = np.random.beta(a=2.5, b=3.0, size=num_samples) * 50.0 + 5.0  # 5 to 55 deg
    twi = 14.0 - (slope_angle / 55.0) * 8.0 + np.random.normal(0, 0.5, size=num_samples)

    # River stage responds to instantaneous rainfall + upstream accumulation
    upstream_depth = 1.2 + (rainfall / 160.0) * 5.0 + (antecedent_24h / 300.0) * 2.0 + np.random.normal(0, 0.2, size=num_samples)
    upstream_depth = np.clip(upstream_depth, 0.5, 8.5)

    flow_velocity = np.sqrt(9.81 * upstream_depth) + np.random.normal(0, 0.3, size=num_samples)
    flow_velocity = np.clip(flow_velocity, 1.0, 10.0)

    # Feature Matrix
    X = np.column_stack([
        rainfall,
        antecedent_24h,
        antecedent_72h,
        soil_moisture,
        pore_pressure,
        slope_angle,
        twi,
        upstream_depth,
        flow_velocity,
    ])

    feature_names = [
        "rainfall_intensity_mm_hr",
        "antecedent_rain_24h_mm",
        "antecedent_rain_72h_mm",
        "soil_moisture_pct",
        "pore_water_pressure_kpa",
        "slope_angle_deg",
        "topographic_wetness_index",
        "upstream_water_depth_m",
        "river_flow_velocity_m_s",
    ]

    # 2. Physics-Informed Ground Truth Labeling Rule
    # Composite Risk Index (0.0 to 1.0)
    risk_index = (
        0.25 * (rainfall / 100.0) +
        0.15 * (antecedent_24h / 180.0) +
        0.20 * (soil_moisture / 90.0) +
        0.15 * (pore_pressure / 60.0) +
        0.15 * (slope_angle / 38.0) +
        0.10 * (upstream_depth / 5.5)
    )

    y = np.zeros(num_samples, dtype=int)
    y[risk_index < 0.35] = 0   # LOW
    y[(risk_index >= 0.35) & (risk_index < 0.60)] = 1  # MODERATE
    y[(risk_index >= 0.60) & (risk_index < 0.82)] = 2  # HIGH
    y[risk_index >= 0.82] = 3  # CRITICAL

    return X, y, feature_names


def train_and_save_model():
    """Trains the XGBoost multi-hazard classifier and serializes to disk."""
    print("[ML-TRAIN] Generating 5,000 synthetic Himalayan disaster records...")
    X, y, feature_names = generate_synthetic_dataset(num_samples=5000)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

    print(f"[ML-TRAIN] Training set: {X_train.shape[0]} samples | Test set: {X_test.shape[0]} samples")

    # XGBoost Classifier
    model = xgb.XGBClassifier(
        n_estimators=150,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        objective="multi:softprob",
        num_class=4,
        random_state=42,
        eval_metric="mlogloss",
    )

    print("[ML-TRAIN] Training XGBoost Multi-Class Risk Model...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"[ML-TRAIN] OK - Model Accuracy on Test Set: {acc * 100:.2f}%\n")
    print(classification_report(y_test, y_pred, target_names=["LOW", "MODERATE", "HIGH", "CRITICAL"]))

    # Save artifact
    output_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(output_dir, "flood_risk_xgboost.joblib")
    meta_path = os.path.join(output_dir, "model_metadata.joblib")

    joblib.dump(model, model_path)
    joblib.dump({"feature_names": feature_names, "accuracy": acc}, meta_path)

    print(f"[ML-TRAIN] Saved trained model artifact to: {model_path}")
    return model, feature_names


if __name__ == "__main__":
    train_and_save_model()
