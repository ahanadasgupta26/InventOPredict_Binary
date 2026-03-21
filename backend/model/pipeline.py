import pandas as pd
import numpy as np
import os

def build_pipeline(dataset_path: str):

    BASE_DIR = os.path.dirname(__file__)
    festival_path = os.path.join(BASE_DIR, "india_festivals_2020_2026 (1).csv")

    # ---------- Load Excel ----------
    df_dict = pd.read_excel(dataset_path, sheet_name=None)

    inventory = df_dict.get("blinkit_inventory")
    orders = df_dict.get("blinkit_orders")
    order_items = df_dict.get("blinkit_order_items")
    products = df_dict.get("blinkit_products")

    if inventory is None or orders is None or order_items is None or products is None:
        raise ValueError("Required sheets missing in Excel file.")

    orders["order_date"] = pd.to_datetime(orders["order_date"], errors="coerce")
    inventory["date"] = pd.to_datetime(inventory["date"], errors="coerce")

    # ---------- Festival ----------
    if os.path.exists(festival_path):
        festival_df = pd.read_csv(festival_path)
        festival_df["Date"] = pd.to_datetime(festival_df["Date"])
    else:
        festival_df = pd.DataFrame(columns=["Date", "impact_score"])

    # ---------- Merge ----------
    df = order_items.merge(
        orders[["order_id", "order_date"]],
        on="order_id",
        how="left"
    )

    df = df.merge(
        products[["product_id", "category"]],
        on="product_id",
        how="left"
    )

    df = df.dropna(subset=["order_date"])

    if df.empty:
        raise ValueError("No valid order_date data after merge.")

    # ---------- Festival Features ----------
    df["festival_score"] = 0

    for _, fest in festival_df.iterrows():
        fest_date = fest["Date"]
        impact = fest.get("impact_score", 1)

        start = fest_date - pd.Timedelta(days=7)
        end = fest_date + pd.Timedelta(days=3)

        df.loc[
            (df["order_date"] >= start) &
            (df["order_date"] <= end),
            "festival_score"
        ] = impact

    df["festival_electronics_boost"] = 0
    df.loc[
        (df["festival_score"] > 0) &
        (df["category"] == "Electronics"),
        "festival_electronics_boost"
    ] = df["festival_score"]

    # ---------- Daily Sales (FOR DASHBOARD) ----------
    daily_sales = df.groupby(
        ["product_id", "order_date"]
    )["quantity"].sum().reset_index()

    if daily_sales.empty:
        raise ValueError("Daily sales dataframe is empty.")

    # ---------- Aggregated Features (FOR PREDICTION) ----------
    product_features = daily_sales.groupby("product_id")["quantity"].agg([
        "mean", "std"
    ]).reset_index()

    product_features.rename(columns={
        "mean": "avg_daily_sales",
        "std": "sales_volatility"
    }, inplace=True)

    product_features["sales_volatility"] = product_features["sales_volatility"].fillna(0)

    # Festival Aggregation
    festival_features = df.groupby("product_id")[[
        "festival_score",
        "festival_electronics_boost"
    ]].mean().reset_index()

    product_features = product_features.merge(
        festival_features,
        on="product_id",
        how="left"
    )

    # ---------- Stock ----------
    stock_received = inventory.groupby("product_id")["stock_received"].sum()
    damaged = inventory.groupby("product_id")["damaged_stock"].sum()

    net_stock = (stock_received - damaged).reset_index()
    net_stock.columns = ["product_id", "net_stock"]

    product_features = product_features.merge(
        net_stock,
        on="product_id",
        how="left"
    )

    product_features["net_stock"] = product_features["net_stock"].fillna(0)

    # ---------- Target ----------
    product_features["future_30_day_demand"] = (
        product_features["avg_daily_sales"] * 30
    )

    # ---------- Product Info ----------
    product_features = product_features.merge(
        products[["product_id", "product_name", "category"]],
        on="product_id",
        how="left"
    )

    if product_features.empty:
        raise ValueError("Final product_features is empty.")

    return {
        "aggregated": product_features,
        "daily_sales": daily_sales
    }