from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os
import tempfile
import google.generativeai as genai
from model.predict import predict_stockout
from model.pipeline import build_pipeline
import smtplib
from email.mime.text import MIMEText
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import date
import joblib

MODEL_PATH = os.path.join("model", "demand_model.pkl")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError("Model file not found.")

model = joblib.load(MODEL_PATH)

print("✅ ML model loaded successfully")
load_dotenv()
# ---------------- API KEY ----------------
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("⚠️ GEMINI_API_KEY not found")
else:
    genai.configure(api_key=API_KEY)

# ---------------- App Config ----------------
app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance/site.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ---------------- Models ----------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    company_name = db.Column(db.String(150), nullable=False)
    company_code = db.Column(db.String(50), unique=True, nullable=False)

    warehouse_name = db.Column(db.String(150), nullable=False)
    warehouse_location = db.Column(db.String(200), nullable=False)
    warehouse_code = db.Column(db.String(50), unique=True, nullable=False)

    password = db.Column(db.String(200), nullable=False)


class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text, nullable=False)


class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    experience = db.Column(db.Text, nullable=False)


class StockoutReminder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    product_name = db.Column(db.String(150), nullable=False)
    stockout_date = db.Column(db.Date, nullable=False)
    reminder_stage = db.Column(db.Integer, default=0)


# ---------------- Create Tables ----------------
with app.app_context():
    db.create_all()

# ---------------- Auth Routes ----------------
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    required_fields = [
        'company_name',
        'company_code',
        'warehouse_name',
        'warehouse_location',
        'warehouse_code',
        'password'
    ]

    for field in required_fields:
        if not data.get(field):
            return jsonify({"message": f"{field} is required"}), 400

    # Check if company code already exists
    if User.query.filter_by(company_code=data['company_code']).first():
        return jsonify({"message": "Company code already exists"}), 409

    hashed_password = generate_password_hash(data['password'])

    new_user = User(
        company_name=data['company_name'],
        company_code=data['company_code'],
        warehouse_name=data['warehouse_name'],
        warehouse_location=data['warehouse_location'],
        warehouse_code=data['warehouse_code'],
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Registration successful"}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    user = User.query.filter_by(warehouse_code=data.get('warehouse_code')).first()

    if not user or not check_password_hash(user.password, data.get('password')):
        return jsonify({"message": "Invalid company code or password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "company_name": user.company_name,
            "company_code": user.company_code,
            "warehouse_name": user.warehouse_name,
            "warehouse_location": user.warehouse_location
        }
    }), 200

from datetime import datetime

@app.route("/create-stockout-reminders", methods=["POST"])
def create_stockout_reminders():
    data = request.get_json()
    email = data.get("email")
    results = data.get("results", [])

    if not email or not results:
        return jsonify({"message": "Invalid data"}), 400
    saved_products = []
    for item in results:
        try:
            stockout_date = datetime.strptime(
                item["stockout_date"], "%Y-%m-%d"
            ).date()

            reminder = StockoutReminder(
                email=email,
                product_name=item["product_name"],
                stockout_date=stockout_date
            )
            db.session.add(reminder)
            saved_products.append(
                f"• {item['product_name']} (Stockout: {item['stockout_date']})"
            )
        except Exception:
            continue

    db.session.commit()
    # check_and_send_reminders()
    # 🔔 IMMEDIATE CONFIRMATION EMAIL
    product_list = "\n".join(saved_products)

    send_email(
        email,
        "Stockout Reminders Activated ✅",
        f"""
Hello,

Your stockout reminders have been successfully activated.

You will receive reminder emails:
• 2 days before stockout
• 1 day before stockout
• On the stockout day (9:00 AM)

Tracked products:
{product_list}

– InventOPredict Team
"""
    )
    return jsonify({"message": "Reminders created"}), 201



# ---------------- Contact Routes ----------------
@app.route('/Contact', methods=['POST'])
def add_contact():
    data = request.get_json()

    new_contact = Contact(
        name=data['name'],
        email=data['email'],
        message=data['message']
    )

    db.session.add(new_contact)
    db.session.commit()

    return jsonify({"message": "Contact saved!"}), 201


@app.route('/Contact', methods=['GET'])
def get_contacts():
    contacts = Contact.query.all()

    return jsonify([
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "message": c.message
        }
        for c in contacts
    ])


# ---------------- Feedback Routes ----------------
@app.route('/Feedback', methods=['POST'])
def add_feedback():
    data = request.get_json()

    new_feedback = Feedback(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        experience=data['experience']
    )

    db.session.add(new_feedback)
    db.session.commit()

    return jsonify({"message": "Feedback submitted!"}), 201


@app.route('/Feedback', methods=['GET'])
def get_feedback():
    feedbacks = Feedback.query.all()

    return jsonify([
        {
            "id": f.id,
            "name": f.name,
            "email": f.email,
            "phone": f.phone,
            "experience": f.experience
        }
        for f in feedbacks
    ])


#dashboard "

@app.route('/predict', methods=['POST'])
def predict():

    print("\n🔵 ===== /predict API HIT =====")

    if 'file' not in request.files:
        print("❌ No file in request")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    print(f"📁 File received: {file.filename}")

    tmp_path = None

    try:
        import tempfile, os

        # Save file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name

        print(f"📌 Temp file saved at: {tmp_path}")

        # 🔥 Run ML Model
        print("⚙️ Running ML model...")
        df = predict_stockout(tmp_path)
        print("✅ ML model execution completed")

        if df is None:
            print("❌ ML returned None")
            return jsonify({"error": "Prediction returned None"}), 500

        if df.empty:
            print("❌ DataFrame is empty")
            return jsonify({"error": "Prediction result is empty"}), 500

        # 🔍 DEBUG DATAFRAME
        print(f"📊 DataFrame shape: {df.shape}")
        print(f"🧾 Columns: {list(df.columns)}")

        print("🔎 Sample Data:")
        print(df.head(3))

        dashboard_data = []

        for i, row in df.iterrows():
            days = int(row["days_left"]) if "days_left" in row else 0
            print("➡️ ROW DATA:", row.to_dict())
            print("➡️ days_left:", row.get("days_left"))
            if days < 15:
                status = "Understock"
            elif days > 50:
                status = "Overstock"
            else:
                status = "Normal"
            print(f"✅ Final days value: {days}")
            dashboard_data.append({
                "product_id": row.get("product_id"),
                "product_name": row.get("product_name", "Unknown"),
                "category": row.get("category", "General"),
                "stock": days,
                "status": status
            })

        print(f"✅ Processed {len(dashboard_data)} products for dashboard")
        print("🚀 FINAL DASHBOARD DATA SAMPLE:")
        print(dashboard_data[:3])
        return jsonify({
            "summary": "ML Dashboard Ready Data",
            "total_products": len(dashboard_data),
            "data": dashboard_data
        })

    except Exception as e:
        print("🔥 ERROR OCCURRED:")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
            print(f"🗑️ Temp file deleted: {tmp_path}")

        print("🔵 ===== END OF REQUEST =====\n")

# ---------------- Prediction Route ----------------
# @app.route('/predict', methods=['POST'])
# def predict():

#     if 'file' not in request.files:
#         return jsonify({"error": "No file uploaded"}), 400

#     file = request.files['file']

#     tmp_path = None

#     try:
#         # Save uploaded file temporarily
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
#             file.save(tmp.name)
#             tmp_path = tmp.name

#         # Run prediction
#         pred_df = predict_stockout(tmp_path)

#         if pred_df is None or pred_df.empty:
#             return jsonify({"error": "Prediction result is empty"}), 500

#         return jsonify({
#             "summary": "Stock prediction analysis completed.",
#             "total_rows": len(pred_df),
#             "fields": pred_df.to_dict(orient="records")
#         })

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     finally:
#         # Ensure temp file is removed even if error occurs
#         if tmp_path and os.path.exists(tmp_path):
#             os.remove(tmp_path)

# ---------------- Product Dashboard Route ----------------

from datetime import datetime, timedelta
import numpy as np

from datetime import datetime, timedelta
import numpy as np
import pandas as pd

@app.route("/product-dashboard/<int:product_id>", methods=["GET"])
def product_dashboard(product_id):

    try:
        from datetime import datetime, timedelta
        import pandas as pd
        import numpy as np

        DATASET_PATH = "final_blinkit_dataset_structured.xlsx"

        # 🔥 Run pipeline
        data = build_pipeline(DATASET_PATH)

        model_df = data["model_df"]
        daily_sales = data["daily_sales"]
        stock_df = data["stock"]

        # ---------- FILTER PRODUCT ----------
        product_df = model_df[
            model_df["product_id"] == product_id
        ].sort_values("order_date")

        if product_df.empty:
            return jsonify({"error": "Product not found"}), 404

        latest = product_df.iloc[-1]

        product_name = latest.get("product_name", "Unknown")
        category = latest.get("category", "General")

        # ---------- PREDICT FUTURE DEMAND ----------
        current = product_df.iloc[-1:].copy()
        future_demand = 0

        for _ in range(30):

            X = current[[
                "lag_1",
                "lag_7",
                "rolling_mean_7",
                "rolling_std_7",
                "festival_score",
                "day_of_week",
                "month",
                "is_spike"
            ]]

            pred = model.predict(X)[0]
            pred = max(pred, 0)

            future_demand += pred

            # update lag for next step
            current["lag_1"] = pred

        # ---------- STOCK ----------
        stock_row = stock_df[stock_df["product_id"] == product_id]
        stock = stock_row["net_stock"].values[0] if not stock_row.empty else 0

        daily_demand = future_demand / 30 if future_demand > 0 else 0.1

        days_left = int(stock / daily_demand)

        today = datetime.today().date()
        stockout_date = (today + timedelta(days=days_left)).strftime("%Y-%m-%d")

        # ---------- STATUS ----------
        if days_left < 5:
            stock_status = "Understock"
        elif days_left > 50:
            stock_status = "Overstock"
        else:
            stock_status = "Normal"

        # ---------- REAL HISTORICAL DATA ----------
        product_sales = daily_sales[
            daily_sales["product_id"] == product_id
        ].sort_values("order_date")

        if product_sales.empty:
            historical_data = []
        else:
            historical_data = product_sales.tail(60)[[
                "order_date", "quantity"
            ]].copy()

            historical_data["date"] = historical_data["order_date"].astype(str)

            historical_data = historical_data[[
                "date", "quantity"
            ]].to_dict(orient="records")

        # ---------- RESPONSE ----------
        return jsonify({
            "product_id": int(product_id),
            "product_name": product_name,
            "category": category,
            "days_left": days_left,
            "stock_status": stock_status,
            "predicted_stockout_date": stockout_date,
            "historical_data": historical_data
        })

    except Exception as e:
        print("Dashboard error:", str(e))
        return jsonify({"error": str(e)}), 500
    
# @app.route("/product-dashboard/<int:product_id>", methods=["GET"])
# def product_dashboard(product_id):

#     try:
#         DATASET_PATH = "proper_blinkit_dataset.xlsx"

#         pipeline_output = build_pipeline(DATASET_PATH)
#         aggregated_df = pipeline_output["aggregated"]

#         product_row = aggregated_df[
#             aggregated_df["product_id"] == product_id
#         ]

#         if product_row.empty:
#             return jsonify({"error": "Product not found"}), 404

#         product_row = product_row.iloc[0]

#         # ---------- Prediction (SAME as /predict) ----------
#         features = [
#             "avg_daily_sales",
#             "sales_volatility",
#             "festival_score",
#             "festival_electronics_boost",
#             "net_stock"
#         ]

#         X = pd.DataFrame([product_row[features]])

#         predicted_30_day_demand = model.predict(X)[0]
#         predicted_daily_demand = max(predicted_30_day_demand / 30, 0.1)

#         net_stock = float(product_row["net_stock"])

#         days_left = int(net_stock / predicted_daily_demand)

#         today = datetime.today().date()
#         predicted_stockout_date = (
#             today + timedelta(days=days_left)
#         ).strftime("%Y-%m-%d")

#         # ---------- Stock Status ----------
#         if days_left < 7:
#             stock_status = "Understock"
#         elif days_left > 60:
#             stock_status = "Overstock"
#         else:
#             stock_status = "Fine"

#         # ---------- Generate 30-day visual trend ----------
#         avg_daily = float(product_row["avg_daily_sales"])

#         historical_data = []

#         for i in range(30):
#             date = today - timedelta(days=29 - i)
#             quantity = max(avg_daily + np.random.randint(-5, 6), 0)

#             historical_data.append({
#                 "date": date.strftime("%Y-%m-%d"),
#                 "quantity": float(quantity)
#             })

#         return jsonify({
#             "product_id": int(product_id),
#             "product_name": product_row["product_name"],
#             "category": product_row["category"],
#             "avg_daily_sales": avg_daily,
#             "days_left": days_left,
#             "stock_status": stock_status,
#             "predicted_stockout_date": predicted_stockout_date,
#             "historical_data": historical_data
#         })

#     except Exception as e:
#         print("Dashboard error:", str(e))
#         return jsonify({"error": str(e)}), 500
    
@app.route("/test-email")
def test_email():
    send_email(
        "inventopredict@gmail.com",
        "Test Email",
        "If you received this, SMTP is working."
    )
    return "Email sent"

# ---------------- Chatbot Route ----------------
@app.route('/chat', methods=['POST'])
def chat():
    import os
    import sqlite3
    import requests

    data = request.get_json()
    message = data.get('message', '')
    context = data.get('context', '')

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DB_PATH = os.path.join(BASE_DIR, "instance", "site.db")
    OPENROUTER_API_KEY = os.getenv("OPENROUTE_API")

    try:
        # ===============================
        # 🔥 STEP 1: CALL OPENROUTER
        # ===============================
        prompt = f"{context}\n\nUser: {message}\nSQL:"

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "mistralai/mistral-7b-instruct",
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            }
        )

        # ❌ API ERROR HANDLE
        if response.status_code != 200:
            print("API ERROR:", response.text)
            return jsonify({"reply": "API Error"})

        result_json = response.json()
        print("FULL RESPONSE:", result_json)

        # ===============================
        # 🔥 STEP 2: EXTRACT SQL SAFELY
        # ===============================
        sql_query = result_json.get("choices", [{}])[0].get("message", {}).get("content", "")

        if not sql_query:
            return jsonify({"reply": "Failed to generate SQL"})

        # CLEAN SQL
        sql_query = sql_query.replace("```sql", "").replace("```", "").strip()

        # 🔥 extract only SELECT part
        if "select" in sql_query.lower():
            sql_query = sql_query[sql_query.lower().find("select"):]

        print("SQL QUERY:", sql_query)

        # ===============================
        # 🔥 SAFETY CHECK
        # ===============================
        if "select" not in sql_query.lower():
            return jsonify({"reply": "Invalid query"})

        # Always limit results
        if "limit" not in sql_query.lower():
            sql_query += " LIMIT 1"

        # ===============================
        # 🔥 STEP 3: EXECUTE SQL
        # ===============================
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute(sql_query)
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]

        conn.close()

        if not rows:
            return jsonify({"reply": []})

        # ===============================
        # 🔥 STEP 4: CLEAN RESULT (NO DUPLICATES)
        # ===============================
        seen = set()
        clean_result = []

        for row in rows:
            obj = {columns[i]: row[i] for i in range(len(columns))}

            key = (obj.get("product_name"), obj.get("stockout_date"))
            if key not in seen:
                seen.add(key)
                clean_result.append(obj)

        # ===============================
        # 🔥 FINAL RESPONSE
        # ===============================
        return jsonify({"reply": clean_result})

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"reply": f"Error: {str(e)}"})



def send_email(to_email, subject, body):
    print("📨 Attempting to send email...")
    print("To:", to_email)
    print("From:", os.getenv("EMAIL_USER"))

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = os.getenv("EMAIL_USER")
    msg["To"] = to_email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(
                os.getenv("EMAIL_USER"),
                os.getenv("EMAIL_PASS")
            )
            server.send_message(msg)

        print("✅ Email sent successfully")

    except Exception as e:
        print("❌ Email failed:", str(e))

from datetime import date, timedelta
from collections import defaultdict

from collections import defaultdict
from datetime import date

def check_and_send_reminders():
    today = date.today()
    print("📅 Running reminder check for:", today)

    reminders = StockoutReminder.query.all()
    # print("🔔 Total reminders:", len(reminders))

    # 🔹 Group emails
    stage_stockout = defaultdict(list)
    stage_2_days = defaultdict(list)
    stage_1_day = defaultdict(list)
    stage_today = defaultdict(list)

    for r in reminders:
        days_left = (r.stockout_date - today).days

        if days_left == 2:
            stage_2_days[r.email].append(r)

        elif days_left == 1:
            stage_1_day[r.email].append(r)

        elif days_left == 0:
            stage_today[r.email].append(r)

        elif days_left < 0:
            stage_stockout[r.email].append(r)

    # 🔔 SEND 2-DAY MAILS
    for email, items in stage_2_days.items():
        product_list = "\n".join(f"• {r.product_name}" for r in items)

        send_email(
            email,
            "Upcoming Stockout Alert (2 Days Left)",
            f"""
Hello,

The following product(s) are expected to run out of stock in 2 days:

{product_list}

Please plan inventory accordingly.

– InventOPredict Team
"""
        )

        for r in items:
            r.reminder_stage = 1

    # 🔔 SEND 1-DAY MAILS
    for email, items in stage_1_day.items():
        product_list = "\n".join(f"• {r.product_name}" for r in items)

        send_email(
            email,
            "Stockout Alert (1 Day Left)",
            f"""
Hello,

The following product(s) are expected to run out of stock tomorrow:

{product_list}

Immediate action is recommended.

– InventOPredict Team
"""
        )

        for r in items:
            r.reminder_stage = 2

    # 🔔 SEND TODAY MAILS + DELETE
    for email, items in stage_today.items():
        product_list = "\n".join(f"• {r.product_name}" for r in items)

        send_email(
            email,
            "Stockout Alert (Today)",
            f"""
Hello,

The following product(s) are expected to run out of stock today:

{product_list}

Please take urgent action.

– InventOPredict Team
"""
        )

        for r in items:
            db.session.delete(r)

        # 🔔 SEND ALREADY STOCKOUT MAIL + DELETE
    for email, items in stage_stockout.items():
        product_list = "\n".join(f"• {r.product_name}" for r in items)

        send_email(
            email,
            "Already Stockout Alert",
            f"""
Hello,

The following product(s) are already out of stock :

{product_list}

Please take urgent action.

– InventOPredict Team
"""
        )

        for r in items:
            db.session.delete(r)
            
    db.session.commit()
    print("✅ Reminder cycle completed")


from apscheduler.schedulers.background import BackgroundScheduler

# scheduler = BackgroundScheduler(timezone="Asia/Kolkata")

# scheduler.add_job(
#     check_and_send_reminders,
#     trigger="cron",
#     hour=9,
#     minute=0
# )

# scheduler.start()




def clear_stockout_reminders():
    deleted = StockoutReminder.query.delete()
    db.session.commit()
    print(f"🧹 Cleared {deleted} stockout reminder(s)")



@app.route("/clear-reminders", methods=["GET"])
def clear_reminders_route():
    clear_stockout_reminders()
    return "Reminders cleared"
# http://127.0.0.1:5000/clear-reminders(clear the table)
# ---------------- Run App ----------------
# if __name__ == '__main__':
#     port = int(os.environ.get("PORT", 10000))
#     app.run(host="0.0.0.0", port=port)
if __name__ == '__main__':
    app.run(debug=True)