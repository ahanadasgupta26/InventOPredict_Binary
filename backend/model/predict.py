import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from .pipeline import build_pipeline

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "demand_model.pkl")

model = joblib.load(MODEL_PATH)


def predict_stockout(input_file):

    data = build_pipeline(input_file)

    df = data["model_df"]
    stock_df = data["stock"]

    results = []

    for product_id in df["product_id"].unique():

        product_df = df[df["product_id"] == product_id].sort_values("order_date")

        if len(product_df) < 10:
            continue

        current = product_df.iloc[-1:].copy()

        future_demand = 0

        for _ in range(30):

            X = current[[
                "lag_1", "lag_7", "rolling_mean_7",
                "rolling_std_7", "festival_score",
                "day_of_week", "month", "is_spike"
            ]]

            pred = max(model.predict(X)[0], 0)
            future_demand += pred

            # update lag
            current["lag_1"] = pred

        # ---------- Stock ----------
        stock_row = stock_df[stock_df["product_id"] == product_id]

        stock = stock_row["net_stock"].values[0] if not stock_row.empty else 0

        daily_demand = future_demand / 30 if future_demand > 0 else 0.1

        days_left = int(stock / daily_demand)

        stockout_date = datetime.today().date() + timedelta(days=days_left)

        product_name = product_df["product_name"].iloc[-1]
        category = product_df["category"].iloc[-1]

        results.append({
            "product_id": product_id,
            "product_name": product_name,
            "category": category,
            "days_left": days_left,
            "stockout_date": str(stockout_date)
        })

    return pd.DataFrame(results)