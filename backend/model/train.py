import os
import joblib
import xgboost as xgb
from sklearn.model_selection import train_test_split
from .pipeline import build_pipeline

BASE_DIR = os.path.dirname(__file__)
dataset_path = os.path.join(BASE_DIR, "blinkit sales dataset.xlsx")

pipeline_output = build_pipeline(dataset_path)
final_df = pipeline_output["aggregated"]

features = [
    "avg_daily_sales",
    "sales_volatility",
    "festival_score",
    "festival_electronics_boost",
    "net_stock"
]

target = "future_30_day_demand"

X = final_df[features].fillna(0)
y = final_df[target]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = xgb.XGBRegressor(
    n_estimators=400,
    learning_rate=0.05,
    max_depth=6
)

model.fit(X_train, y_train)

model_path = os.path.join(BASE_DIR, "demand_model.pkl")
joblib.dump(model, model_path)

print("✅ Model trained successfully.")