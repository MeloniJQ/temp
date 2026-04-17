import razorpay
import os
import sqlite3  # ✅ FIXED (IMPORTANT)
from dotenv import load_dotenv
from datetime import datetime, UTC
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

# -------------------------
# LOAD ENV
# -------------------------
load_dotenv()

# -------------------------
# RAZORPAY CLIENT
# -------------------------
razorpay_client = razorpay.Client(auth=(
    os.getenv("RAZORPAY_KEY_ID"),
    os.getenv("RAZORPAY_KEY_SECRET")
))

app = Flask(__name__)

# ✅ FIXED CORS
CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]}},
)

# ✅ EXTRA SAFETY (preflight fix)
@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response

app.config["DATABASE"] = "backend/data/energy.db"

# -------------------------
# FAKE SENSOR DATA
# -------------------------
fake_sensor_data = {
    "voltage": 230,
    "current": 5.0,
    "power": 1150.0,
    "energy": 1.15,
    "timestamp": datetime.now(UTC).isoformat(),
}

def sensor_loop():
    global fake_sensor_data
    while True:
        voltage = random.randint(210, 239)
        current = round(random.uniform(1.5, 10.0), 2)
        power = round(voltage * current, 2)
        energy = round(power * 0.001, 3)

        fake_sensor_data = {
            "voltage": voltage,
            "current": current,
            "power": power,
            "energy": energy,
            "timestamp": datetime.now(UTC).isoformat(),
        }

        threading.Event().wait(2)

threading.Thread(target=sensor_loop, daemon=True).start()

# -------------------------
# INIT DB
# -------------------------
with app.app_context():
    init_db()

@app.teardown_appcontext
def teardown(exception):
    close_db()

# -------------------------
# ROOT
# -------------------------
@app.route("/")
def home():
    return jsonify({"message": "Backend is running successfully"})

# -------------------------
# SIGNUP (FIXED)
# -------------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(force=True)

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    location = data.get("location", "").strip()
    meter_id = data.get("meter_id", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    try:
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

        db = get_db()
        db.execute(
            "INSERT INTO users (email, password, name, phone, location, meter_id) VALUES (?, ?, ?, ?, ?, ?)",
            (email, hashed, name, phone, location, meter_id)
        )
        db.commit()

        return jsonify({
            "user": {
                "id": email,
                "email": email,
                "name": name,
                "meter_id": meter_id,
                "location": location,
            }
        }), 201

    except sqlite3.IntegrityError:  # ✅ FIXED CRASH
        return jsonify({"error": "Email already registered"}), 409

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------------
# LOGIN
# -------------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    db = get_db()
    user = db.execute(
        "SELECT * FROM users WHERE email=?",
        (email,)
    ).fetchone()

    if not user or not bcrypt.checkpw(password.encode(), user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({"user": {
        "id": user["email"],
        "email": user["email"],
        "name": user["name"],
        "meter_id": user["meter_id"],
        "location": user["location"],
        "daily_limit": user.get("daily_limit", 50),
    }})

# -------------------------
# 🔥 RAZORPAY CREATE ORDER
# -------------------------
@app.route("/api/payments/create-order", methods=["POST"])
def create_order():
    data = request.get_json(force=True)

    amount_paise = int(data["amount"] * 100)

    order = razorpay_client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": str(uuid4()),
    })

    return jsonify({
        "order_id": order["id"],
        "amount": amount_paise,
        "key": os.getenv("RAZORPAY_KEY_ID")
    })

# -------------------------
# 🔥 RAZORPAY VERIFY
# -------------------------
@app.route("/api/payments/verify", methods=["POST"])
def verify_payment():
    data = request.get_json(force=True)

    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": data["razorpay_order_id"],
            "razorpay_payment_id": data["razorpay_payment_id"],
            "razorpay_signature": data["razorpay_signature"],
        })
    except Exception:
        return jsonify({"error": "Signature mismatch"}), 400

    db = get_db()
    db.execute(
        "INSERT INTO payments (amount, status, method, reference, description) VALUES (?,?,?,?,?)",
        (data["amount"] / 100, "success", "razorpay",
         data["razorpay_payment_id"], "Utility bill payment")
    )
    db.commit()

    return jsonify({"message": "Payment verified"})
    
# -------------------------
# RUN
# -------------------------
if __name__ == "__main__":
    app.run(debug=True)