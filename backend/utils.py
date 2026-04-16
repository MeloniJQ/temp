import sqlite3
from datetime import datetime, timezone

COST_PER_UNIT = 8.5
HIGH_USAGE_THRESHOLD = 2000.0


def parse_timestamp(timestamp_text: str):
    try:
        return datetime.strptime(timestamp_text, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
    except Exception:
        return None


def calculate_energy_units(power_watts: float, previous_timestamp: str | None) -> float:
    if not previous_timestamp:
        return 0.0

    previous_time = parse_timestamp(previous_timestamp)
    if not previous_time:
        return 0.0

    now = datetime.now(timezone.utc)
    duration_seconds = (now - previous_time).total_seconds()
    duration_hours = max(duration_seconds / 3600.0, 0)
    return round((power_watts / 1000.0) * duration_hours, 6)


def calculate_cost(units: float) -> float:
    return round(units * COST_PER_UNIT, 2)


def detect_high_usage_alert(power_watts: float) -> bool:
    return power_watts > HIGH_USAGE_THRESHOLD


def monthly_estimate_units(current_power_watts: float) -> float:
    hours_per_month = 24 * 30
    return round((current_power_watts / 1000.0) * hours_per_month, 3)


def format_reading(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "timestamp": row["timestamp"],
        "voltage": row["voltage"],
        "current": row["current"],
        "power": row["power"],
        "energy_units": round(row["energy_units"], 6),
    }
