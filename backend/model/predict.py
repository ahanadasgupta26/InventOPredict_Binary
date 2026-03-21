import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from .pipeline import build_pipeline

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "demand_model.pkl")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError("Model file not found. Train the model first.")

model = joblib.load(MODEL_PATH)


def predict_stockout(input_file):

    # Run updated pipeline
    pipeline_output = build_pipeline(input_file)

    # Use only aggregated features for prediction
    final_df = pipeline_output["aggregated"]

    features = [
        "avg_daily_sales",
        "sales_volatility",
        "festival_score",
        "festival_electronics_boost",
        "net_stock"
    ]

    # Ensure required features exist
    for col in features:
        if col not in final_df.columns:
            raise ValueError(f"Missing required column: {col}")

    # Prepare feature matrix
    X_new = final_df[features].fillna(0)

    if X_new.empty:
        raise ValueError("No data available for prediction.")

    # Model prediction
    predicted_30_day_demand = model.predict(X_new)

    # Convert to daily demand (minimum safeguard)
    predicted_daily_demand = predicted_30_day_demand / 30
    predicted_daily_demand = np.maximum(predicted_daily_demand, 0.1)

    # Calculate stockout days
    stockout_days = final_df["net_stock"] / predicted_daily_demand
    stockout_days = stockout_days.clip(lower=0).astype(int)

    # Calculate stockout date
    predicted_stockout_date = (
        pd.Timestamp(datetime.today().date()) +
        pd.to_timedelta(stockout_days, unit="D")
    )

    # Final result
    result = pd.DataFrame({
        "product_id": final_df["product_id"],
        "product_name": final_df["product_name"],
        "category": final_df["category"],
        "days_left": stockout_days,
        "stockout_date": predicted_stockout_date.astype(str)
    })

    return result