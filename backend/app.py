from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from db import init_db, get_db, close_db
from utils import (
    calculate_energy_units,
    calculate_cost,
    detect_high_usage_alert,
    monthly_estimate_units,
    format_reading,
)
from uuid import uuid4
import bcrypt
import random
import threading

app = Flask(__name__)

CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": ["http://localhost:3000"]}},
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)

app.config["DATABASE"] = "backend/data/energy.db"

fake_sensor_data = {
    "voltage": 230,
    "current": 5.0,
    "power": 1150.0,
    "energy": 1.15,
    "timestamp": datetime.utcnow().isoformat() + "Z",
}


def refresh_fake_sensor_data():
    global fake_sensor_data

    voltage = random.randint(210, 239)
    current = round(random.uniform(1.5, 10.0), 2)
    power = round(voltage * current, 2)
    energy = round(power * 0.001, 3)

    fake_sensor_data = {
        "voltage": voltage,
        "current": current,
        "power": power,
        "energy": energy,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }

    threading.Timer(2.0, refresh_fake_sensor_data).start()


@app.before_first_request
def start_fake_sensor_generator():
    refresh_fake_sensor_data()


# -------------------------
# INIT DB ON START
# -------------------------
with app.app_context():
    init_db()


# -------------------------
# CLOSE DB
# -------------------------
@app.teardown_appcontext
def teardown(exception):
    close_db()


# -------------------------
# ROOT ROUTE (FIX 404)
# -------------------------
@app.route("/")
def home():
    return jsonify({"message": "Backend is running successfully"})


# -------------------------
# FAKE SENSOR DATA
# -------------------------
@app.route("/api/data")
def fake_data():
    return jsonify(fake_sensor_data)


# -------------------------
# PASSWORD HELPERS
# -------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(hashed_password: str, password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


# -------------------------
# INGEST DATA
# -------------------------
@app.route("/api/ingest", methods=["POST"])
def ingest_reading():
    data = request.get_json(force=True)

    try:
        voltage = float(data["voltage"])
        current = float(data["current"])
        power = float(data["power"])
    except:
        return jsonify({"error": "Invalid input"}), 400

    db = get_db()

    last = db.execute(
        "SELECT timestamp, energy_units FROM readings ORDER BY timestamp DESC LIMIT 1"
    ).fetchone()

    prev_units = last["energy_units"] if last else 0.0
    prev_time = last["timestamp"] if last else None

    new_units = calculate_energy_units(power, prev_time)
    total_units = round(prev_units + new_units, 6)

    cost = calculate_cost(total_units)
    alert = detect_high_usage_alert(power)

    db.execute(
        "INSERT INTO readings (timestamp, voltage, current, power, energy_units) "
        "VALUES (CURRENT_TIMESTAMP, ?, ?, ?, ?)",
        (voltage, current, power, total_units),
    )
    db.commit()

    if alert:
        db.execute(
            "INSERT INTO alerts (timestamp, level, message) VALUES (CURRENT_TIMESTAMP, ?, ?)",
            ("high", f"High power usage: {power}W"),
        )
        db.commit()

    return jsonify({
        "message": "Saved",
        "data": {
            "voltage": voltage,
            "current": current,
            "power": power,
            "energy_units": total_units,
            "cost": cost,
            "alert": alert
        }
    }), 201


# -------------------------
# LIVE DATA
# -------------------------
@app.route("/api/live")
def live():
    db = get_db()

    row = db.execute(
        "SELECT * FROM readings ORDER BY timestamp DESC LIMIT 1"
    ).fetchone()

    if not row:
        return jsonify({"error": "No data"}), 404

    data = format_reading(row)

    data["cost"] = calculate_cost(data["energy_units"])
    data["monthly_units"] = monthly_estimate_units(data["power"])

    return jsonify({"live": data})


# -------------------------
# HISTORY
# -------------------------
@app.route("/api/history")
def history():
    db = get_db()

    rows = db.execute(
        "SELECT * FROM readings ORDER BY timestamp DESC LIMIT 100"
    ).fetchall()

    return jsonify({
        "history": [format_reading(r) for r in rows]
    })


# -------------------------
# SUMMARY
# -------------------------
@app.route("/api/summary")
def summary():
    db = get_db()

    latest = db.execute(
        "SELECT energy_units FROM readings ORDER BY timestamp DESC LIMIT 1"
    ).fetchone()

    avg = db.execute(
        "SELECT AVG(power) as avg_power FROM readings"
    ).fetchone()["avg_power"]

    if not latest:
        return jsonify({"error": "No data"}), 404

    return jsonify({
        "total_units": latest["energy_units"],
        "total_bill": calculate_cost(latest["energy_units"]),
        "average_power": round(avg or 0, 2)
    })


# -------------------------
# ALERTS
# -------------------------
@app.route("/api/alerts")
def alerts():
    db = get_db()

    rows = db.execute(
        "SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 50"
    ).fetchall()

    return jsonify({
        "alerts": [
            {
                "id": r["id"],
                "timestamp": r["timestamp"],
                "title": "High usage alert" if r["level"] == "high" else "System alert",
                "description": r["message"],
                "severity": "critical" if r["level"] == "high" else "warning",
            }
            for r in rows
        ]
    })


# -------------------------
# NOTIFICATIONS
# -------------------------
@app.route("/api/notifications")
def notifications():
    db = get_db()

    live_row = db.execute(
        "SELECT * FROM readings ORDER BY timestamp DESC LIMIT 1"
    ).fetchone()

    if not live_row:
        return jsonify({"notifications": ["No live energy data available."]}), 200

    avg_power = db.execute(
        "SELECT AVG(power) as avg_power FROM readings"
    ).fetchone()["avg_power"] or 0.0

    notifications = []
    if live_row["power"] > 1800:
        notifications.append("High usage detected, consider reducing AC usage and heavy appliance cycles.")
    elif live_row["power"] > 1200:
        notifications.append("Usage is elevated; keep an eye on consumption during peak hours.")
    else:
        notifications.append("Usage is stable today. Continue maintaining efficient behavior.")

    if live_row["energy_units"] > 30:
        notifications.append("Daily energy consumption is above the expected trend. Review your meter activity.")

    forecast_units = round(((avg_power + live_row["power"]) / 2) / 1000 * 24, 2)
    if forecast_units > 50:
        notifications.append("Forecast shows increasing consumption ahead — schedule appliance usage for off-peak hours.")

    return jsonify({"notifications": notifications}), 200


# -------------------------
# PAYMENTS
# -------------------------
@app.route("/api/payments", methods=["GET", "POST"])
def payments():
    db = get_db()

    if request.method == "GET":
        rows = db.execute(
            "SELECT * FROM payments ORDER BY timestamp DESC LIMIT 20"
        ).fetchall()

        return jsonify({
            "payments": [
                {
                    "id": r["id"],
                    "timestamp": r["timestamp"],
                    "amount": r["amount"],
                    "status": r["status"],
                    "method": r["method"],
                    "reference": r["reference"],
                    "description": r["description"],
                }
                for r in rows
            ]
        })

    data = request.get_json(force=True)
    amount = data.get("amount")
    method = data.get("method", "card")
    description = data.get("description", "Bill payment")

    if amount is None or amount <= 0:
        return jsonify({"error": "Invalid payment amount"}), 400

    success = amount < 10000
    status = "success" if success else "failed"
    reference = str(uuid4())

    db.execute(
        "INSERT INTO payments (amount, status, method, reference, description) VALUES (?, ?, ?, ?, ?)",
        (amount, status, method, reference, description),
    )
    db.commit()

    if not success:
        return jsonify({"error": "Payment failed due to gateway timeout. Please retry."}), 502

    return jsonify({
        "message": "Payment recorded successfully",
        "payment": {
            "amount": amount,
            "status": status,
            "method": method,
            "reference": reference,
            "description": description,
        },
    }), 201


# -------------------------
# SIGNUP
# -------------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(force=True)

    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    phone = data.get("phone")
    location = data.get("location")
    meter_id = data.get("meterId")

    if not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    db = get_db()

    exists = db.execute(
        "SELECT id FROM users WHERE email=?",
        (email,)
    ).fetchone()

    if exists:
        return jsonify({"error": "User exists"}), 409

    hashed = hash_password(password)

    cursor = db.execute(
        "INSERT INTO users (email, password, name, phone, location, meter_id) VALUES (?, ?, ?, ?, ?, ?)",
        (email, hashed, name, phone, location, meter_id)
    )
    db.commit()
    user_id = cursor.lastrowid

    return jsonify({
        "message": "Signup success",
        "user": {"id": user_id, "email": email, "name": name, "phone": phone, "location": location, "meterId": meter_id}
    })


# -------------------------
# INSIGHTS
# -------------------------
@app.route("/api/insights")
def insights():
    db = get_db()

    live_row = db.execute(
        "SELECT * FROM readings ORDER BY timestamp DESC LIMIT 1"
    ).fetchone()

    if not live_row:
        return jsonify({"error": "No data"}), 404

    avg_power = db.execute(
        "SELECT AVG(power) as avg_power FROM readings"
    ).fetchone()["avg_power"] or 0.0

    latest_units = live_row["energy_units"]
    cost = calculate_cost(latest_units)
    forecast_units = round(((avg_power + live_row["power"]) / 2) / 1000 * 24, 2)
    forecast_cost = calculate_cost(forecast_units)

    status = "normal"
    if live_row["power"] > 2500 or avg_power > 1800:
        status = "high"
    if live_row["power"] > 3000:
        status = "anomaly"

    temp = 24 + min(12, round(live_row["power"] / 250.0))
    weather_description = (
        "Hot and humid conditions, ideal for efficient cooling management."
        if temp >= 32
        else "Warm weather — pay attention to cooling and ventilation."
        if temp >= 26
        else "Mild weather, a good time to reduce AC and rely on natural airflow."
    )

    weather = [
        {
            "day": (datetime.now() + timedelta(days=i)).strftime("%A"),
            "condition": "Hot" if temp >= 32 else "Warm" if temp >= 26 else "Mild",
            "description": weather_description,
            "high": temp + i,
            "low": temp - 3 + i,
        }
        for i in range(1, 4)
    ]

    suggestions = []
    notifications = []

    if status == "anomaly":
        suggestions.append("Anomaly detected in consumption. Check high-wattage devices and meter connections.")
        notifications.append("An unusual consumption spike has been observed. Inspect appliances now.")
    elif status == "high":
        suggestions.append("Reduce air conditioning and heavy appliance use during peak hours.")
        notifications.append("High usage detected, consider reducing AC usage.")
    else:
        suggestions.append("Usage is stable today. Keep the system optimized and avoid unnecessary loads.")
        notifications.append("Usage is stable today. Good job maintaining efficient energy habits.")

    if temp >= 32:
        suggestions.append("Use AC at 25°C, close curtains, and run fans for efficient cooling.")
        notifications.append("Hot weather detected. Smart AC management can save energy.")
    elif temp >= 26:
        suggestions.append("Mild weather is ideal for reducing cooling devices and using natural airflow.")
    else:
        suggestions.append("Temperatures are mild. Reduce cooling devices and rely on fresh air.")

    if forecast_units > latest_units * 1.2:
        notifications.append("Forecasted consumption is rising. Shift appliances to off-peak periods.")

    recommendation = (
        "Reduce heavy load now and shift appliances to off-peak hours."
        if status != "normal"
        else "Maintain current usage and continue efficient habits."
    )

    return jsonify({
        "live": format_reading(live_row),
        "summary": {
            "total_units": latest_units,
            "total_bill": cost,
            "average_power": round(avg_power, 2),
        },
        "forecast": {
            "next_24h_units": forecast_units,
            "next_24h_cost": forecast_cost,
            "risk_level": status,
        },
        "weather": weather,
        "suggestions": suggestions,
        "notifications": notifications,
        "status": status,
        "message": (
            "High usage detected. Take action to reduce load." if status != "normal"
            else "Energy use is within expected ranges."
        ),
        "recommendation": recommendation,
    })


# -------------------------
# LOGIN
# -------------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)

    email = data.get("email")
    password = data.get("password")

    db = get_db()

    user = db.execute(
        "SELECT * FROM users WHERE email=?",
        (email,)
    ).fetchone()

    if not user or not check_password(user["password"], password):
        return jsonify({"error": "Invalid login"}), 401

    return jsonify({
        "message": "Login success",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "phone": user["phone"],
            "location": user["location"],
            "meterId": user["meter_id"]
        }
    })


# -------------------------
# RUN APP (ONLY ONCE)
# -------------------------
if __name__ == "__main__":
    app.run(debug=True)
