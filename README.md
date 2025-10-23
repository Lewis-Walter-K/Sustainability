# Sustainability

Small demo repository that hosts a React + Vite frontend and a prototype Python FastAPI model server used by the dashboard.

## Quick start (Windows / PowerShell)

Prerequisites:
- Python 3.9+ with pip
- Node.js 16+ and npm
- Optional: GPU / TensorFlow environment if you plan to use `best_nn_smogn_model.keras` for real inference

1) Install Python dependencies (in a virtualenv or conda environment):

```powershell
cd C:\Sustainability
pip install -r requirements.txt
```

2) Start the Python model server (serves on port 8000):

```powershell
cd C:\Sustainability
# development mode with autoreload
python -m uvicorn model_server:app --reload --port 8000
```

3) Start the frontend dev server (Vite):

```powershell
cd C:\Sustainability\4greener-ui
npm install
npm run dev
```

If port 5173 is already in use, Vite will pick the next available port (e.g. 5174).

4) Open the app in your browser (example):

- Frontend: http://localhost:5173/ (or the port Vite reports)
- Model API health: http://127.0.0.1:8000/health

## Notes
- The FastAPI server will attempt to load `best_nn_smogn_model.keras` from the repository root. If that file is missing the server falls back to a simple heuristic (returns the lag input as prediction).
- The prototype server exposes endpoints: `/health`, `/data`, `/predict`, `/update-actual`, `/actuals`.
- CORS is enabled for development (allow_origins = ['*']).

If you want, I can add a PowerShell script to run both servers concurrently.
