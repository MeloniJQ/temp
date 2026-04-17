import razorpay
import os
import sqlite3
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

load_dotenv()

razorpay_client = razorpay.Client(auth=(
    os.getenv("RAZORPAY_KEY_ID"),
    os.getenv("RAZORPAY_KEY_SECRET")
))

app = Flask(__name__)

# ✅ IMPROVED CORS: Explicitly allow the origin and common headers
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
}, supports_credentials=True)

app.config["DATABASE"] = "backend/data/energy.db"

# --- Sensor Data Mock ---
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

with app.app_context():
    init_db()

@app.teardown_appcontext
def teardown(exception):
    close_db()

@app.route("/")
def home():
    return jsonify({"message": "Backend is running successfully"})

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
        return jsonify({"user": {"email": email, "name": name}}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already registered"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    db = get_db()
    user = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    stored_pw = user["password"]
    if isinstance(stored_pw, str):
        stored_pw = stored_pw.encode()

    if not bcrypt.checkpw(password.encode(), stored_pw):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "user": {
            "email": user["email"],
            "name": user["name"],
            "meter_id": user["meter_id"]
        }
    })

@app.route("/api/payments/create-order", methods=["POST"])
def create_order():
    data = request.get_json(force=True)
    amount_paise = int(data["amount"] * 100)
    order = razorpay_client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": str(uuid4()),
    })
    return jsonify({"order_id": order["id"], "amount": amount_paise, "key": os.getenv("RAZORPAY_KEY_ID")})

if __name__ == "__main__":
    app.run(debug=True, port=5000)