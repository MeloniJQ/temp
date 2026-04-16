# Smart Energy Meter Backend

This is a Flask backend for the Smart Energy Meter Dashboard.

## Setup

1. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate it:
   - PowerShell: `venv\Scripts\Activate`
   - bash: `source venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Run

```bash
python app.py
```

The backend will be available at `http://localhost:5000`.

## Available APIs

- `POST /api/ingest`
- `GET /api/live`
- `GET /api/history`
- `GET /api/summary`
- `GET /api/alerts`
- `POST /signup`
- `POST /login`
