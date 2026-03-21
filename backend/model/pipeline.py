import pandas as pd
import numpy as np
import os

def build_pipeline(dataset_path: str):

    BASE_DIR = os.path.dirname(__file__)
    festival_path = os.path.join(BASE_DIR, "india_festivals_2020_2026.csv")

    # ---------- Load ----------
    df_dict = pd.read_excel(dataset_path, sheet_name=None)

    daily_sales = df_dict.get("daily_sales")
    inventory = df_dict.get("blinkit_inventory")
    products = df_dict.get("blinkit_products")

    if daily_sales is None:
        raise ValueError("daily_sales sheet is required!")
    
    # 🔥 STANDARDIZE COLUMN NAMES
    daily_sales.columns = daily_sales.columns.str.lower()

    # ✅ FIX YOUR CASE (sold → quantity)
    daily_sales.rename(columns={
    "sold": "quantity"
    }, inplace=True)
    
    
    # ---------- Format ----------
    daily_sales["order_date"] = pd.to_datetime(daily_sales["date"])
    daily_sales = daily_sales.sort_values(["product_id", "order_date"])

    # ---------- Festival ----------
    if os.path.exists(festival_path):
        fest = pd.read_csv(festival_path)
        fest["Date"] = pd.to_datetime(fest["Date"])
    else:
        fest = pd.DataFrame(columns=["Date", "impact_score"])

    daily_sales["festival_score"] = 0

    for _, row in fest.iterrows():
        start = row["Date"] - pd.Timedelta(days=7)
        end = row["Date"] + pd.Timedelta(days=3)

        daily_sales.loc[
            (daily_sales["order_date"] >= start) &
            (daily_sales["order_date"] <= end),
            "festival_score"
        ] = row.get("impact_score", 1)

    # ---------- Time Features ----------
    daily_sales["day_of_week"] = daily_sales["order_date"].dt.dayofweek
    daily_sales["month"] = daily_sales["order_date"].dt.month

    # Lag
    daily_sales["lag_1"] = daily_sales.groupby("product_id")["quantity"].shift(1)
    daily_sales["lag_7"] = daily_sales.groupby("product_id")["quantity"].shift(7)

    # Rolling
    daily_sales["rolling_mean_7"] = daily_sales.groupby("product_id")["quantity"] \
        .rolling(7).mean().reset_index(0, drop=True)

    daily_sales["rolling_std_7"] = daily_sales.groupby("product_id")["quantity"] \
        .rolling(7).std().reset_index(0, drop=True)

    # ---------- Spike Detection ----------
    daily_sales["z_score"] = (
        (daily_sales["quantity"] - daily_sales["rolling_mean_7"]) /
        (daily_sales["rolling_std_7"] + 1e-5)
    )

    daily_sales["is_spike"] = (daily_sales["z_score"] > 2).astype(int)

    # ---------- Target ----------
    daily_sales["target"] = daily_sales.groupby("product_id")["quantity"].shift(-1)

    # Drop NA
    model_df = daily_sales.dropna()

    # ---------- Stock ----------
    if inventory is not None:
        stock_received = inventory.groupby("product_id")["stock_received"].sum()
        damaged = inventory.groupby("product_id")["damaged_stock"].sum()

        net_stock = (stock_received - damaged).reset_index()
        net_stock.columns = ["product_id", "net_stock"]
    else:
        net_stock = pd.DataFrame(columns=["product_id", "net_stock"])

    # ---------- Product Info ----------

    return {
        "model_df": model_df,
        "daily_sales": daily_sales,
        "stock": net_stock
    }