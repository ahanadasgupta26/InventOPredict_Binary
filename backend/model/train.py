import os
import joblib
import xgboost as xgb
from sklearn.model_selection import train_test_split
from .pipeline import build_pipeline

BASE_DIR = os.path.dirname(__file__)
dataset_path = os.path.join(BASE_DIR, "blinkit sales dataset.xlsx")

data = build_pipeline(dataset_path)
df = data["model_df"]

features = [
    "lag_1",
    "lag_7",
    "rolling_mean_7",
    "rolling_std_7",
    "festival_score",
    "day_of_week",
    "month",
    "is_spike"
]

target = "target"

X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, shuffle=False
)

model = xgb.XGBRegressor(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=6
)

model.fit(X_train, y_train)

joblib.dump(model, os.path.join(BASE_DIR, "demand_model.pkl"))

print("✅ Model trained using DAILY SALES")