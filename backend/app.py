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
import bcrypt

app = Flask(__name__)

CORS(app)

app.config["DATABASE"] = "backend/data/energy.db"


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
                "level": r["level"],
                "message": r["message"]
            }
            for r in rows
        ]
    })


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

    forecast_units = round(((avg_power + live_row["power"]) / 2) / 1000 * 24, 3)
    forecast_cost = calculate_cost(forecast_units)

    status = "normal"
    if live_row["power"] > 2000 or avg_power > 1800:
        status = "high"

    if live_row["power"] > 2500:
        status = "anomaly"

    weather_conditions = [
        {"condition": "Sunny", "description": "Clear skies and mild temperatures."},
        {"condition": "Partly Cloudy", "description": "Some clouds with bright periods."},
        {"condition": "Cloudy", "description": "Overcast with light winds."},
        {"condition": "Showers", "description": "Light rain showers expected."},
        {"condition": "Thunderstorms", "description": "Possible storms and higher humidity."},
    ]

    weather = []
    now = datetime.now()
    for i in range(1, 4):
        forecast = weather_conditions[i % len(weather_conditions)]
        weather.append({
            "day": (now + timedelta(days=i)).strftime("%A"),
            "condition": forecast["condition"],
            "description": forecast["description"],
            "high": 28 + i,
            "low": 18 + i,
        })

    suggestions = [
        "Shift high-power appliances to off-peak hours.",
        "Check the meter and connected devices for unexpected load.",
        "Schedule charging or heavy appliances for late night hours.",
    ]

    notifications = [
        "If usage stays high, your daily bill could increase significantly.",
        "A high-usage alert may trigger if power remains above threshold.",
    ]

    if status == "normal":
        suggestions.insert(0, "Your system is stable. Keep monitoring for sudden spikes.")
        notifications = ["No urgent alerts detected. Continue normal operations."]

    if status == "high":
        suggestions.insert(0, "Reduce heavy loads this evening to avoid surging consumption.")
        notifications.insert(0, "Current power usage is above the preferred threshold.")

    recommendation = (
        "Reduce heavy load now and shift appliances to off-peak hours."
        if status != "normal"
        else "Keep monitoring thresholds and maintain current usage levels."
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