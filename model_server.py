from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import tensorflow as tf
import json
from typing import List, Optional

app = FastAPI(title="4Greener Model API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    lag1: List[float]  # 24 values
    lag1_total: float
    year: int
    day_of_week: int
    month: int
    individual_code: Optional[int] = 0


class PredictResponse(BaseModel):
    hourly: List[float]
    total: float


class ComputeLagRequest(BaseModel):
    # Accept two 24-value arrays representing Yesterday1 (current day reference) and Yesterday2 (previous day)
    yesterday1: List[Optional[float]]
    yesterday2: List[Optional[float]]


class ComputeLagResponse(BaseModel):
    lag: List[Optional[float]]
    formulas: List[str]


# Load model at startup (expects best_nn_smogn_model.keras in workspace root)
try:
    model = tf.keras.models.load_model("best_nn_smogn_model.keras")
except Exception:
    model = None


@app.get("/health")
def health():
    return {"ok": True, "model_loaded": model is not None}


@app.get("/data")
def data():
    """Return Yesterday1/Yesterday2/Lag arrays if available in app.py, else return fallback examples."""
    try:
        import importlib.util, os
        spec = importlib.util.spec_from_file_location("user_app", os.path.join(os.getcwd(), "app.py"))
        user_app = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(user_app)
        y1 = getattr(user_app, "Yesterday1", None)
        y2 = getattr(user_app, "Yesterday", None) or getattr(user_app, "Yesterday2", None)
        lag = getattr(user_app, "Lag", None)
        # basic sanitization: convert to list of floats and ensure length 24
        def sanitize(arr):
            if not arr or not hasattr(arr, '__len__'):
                return None
            try:
                vals = [float(x) for x in arr]
                if len(vals) != 24:
                    return None
                return vals
            except Exception:
                return None

        sy1 = sanitize(y1)
        sy2 = sanitize(y2)
        slag = sanitize(lag)
        if sy1 and sy2 and slag:
            return {"yesterday1": sy1, "yesterday2": sy2, "lag": slag}
    except Exception:
        pass

    # fallback examples
    fallback_y1 = [39.0,38.0,38.0,37.0,28.0,30.0,27.0,19.0,0.0,0.0,0.0,0.0,0.0,0.0,2.0,35.0,5.0,23.0,12.0,68.0,80.0,65.0,25.0,31.0]
    fallback_y2 = [27.0,26.0,26.0,26.0,26.0,26.0,26.0,3.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,4.0,39.0,57.0,18.0,17.0,31.0,51.0,41.0]
    fallback_lag = [-4.0,-1.0,0.0,0.0,0.0,0.0,0.0,-23.0,-3.0,0.0,0.0,0.0,0.0,1.0,-1.0,0.0,4.0,35.0,18.0,-39.0,-1.0,14.0,20.0,-10.0]
    return {"yesterday1": fallback_y1, "yesterday2": fallback_y2, "lag": fallback_lag}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if model is None:
        # fallback: simple naive repeat of last day
        hourly = [float(x) for x in req.lag1]
        return PredictResponse(hourly=hourly, total=sum(hourly))

    # Build input vector according to the training columns used in notebook
    # columns = Lag1_0..Lag1_23, Lag1_Total, Year, Day of Week, Month, Individual code
    x = np.array(req.lag1 + [req.lag1_total, req.year, req.day_of_week, req.month, req.individual_code], dtype=float)
    x = x.reshape((1, -1))
    pred = model.predict(x)
    hourly = pred.flatten().tolist()
    # clamp negative predictions to 0 and round to 2 decimal places
    hourly_clamped = []
    for x in hourly:
        try:
            v = 0.0 if x is None else float(x)
        except Exception:
            v = 0.0
        v = max(0.0, v)
        v = round(v, 2)
        hourly_clamped.append(v)
    total = float(sum(hourly_clamped))
    return PredictResponse(hourly=hourly_clamped, total=total)



@app.post("/compute-lag", response_model=ComputeLagResponse)
def compute_lag(payload: ComputeLagRequest):
    """Compute Lag1_0..Lag1_23 following the exact logic used in the notebook (per-individual group applied there).

    Formula (per hour m):
      if m > 0: Lag1_m = yesterday1[m] - yesterday1[m-1]
      if m == 0: Lag1_0 = yesterday1[0] - yesterday2[23]

    The endpoint returns a list of 24 lag values (floats or null) and a human-readable formula string per hour
    that documents which operands were used. None/null is returned for hours where inputs are missing.
    """
    y1 = payload.yesterday1
    y2 = payload.yesterday2
    if not (isinstance(y1, list) and isinstance(y2, list)):
        return ComputeLagResponse(lag=[None] * 24, formulas=["invalid input"] * 24)

    # normalize lengths and prepare outputs
    def _get_val(arr, idx):
        try:
            v = arr[idx]
            if v is None:
                return None
            return float(v)
        except Exception:
            return None

    lag_out: List[Optional[float]] = [None] * 24
    formulas: List[str] = [""] * 24

    for m in range(24):
        if m > 0:
            a = _get_val(y1, m)
            b = _get_val(y1, m - 1)
            if a is None or b is None:
                lag_out[m] = None
                formulas[m] = f"Lag1_{m}: missing operand(s) -> yesterday1[{m}]={a}, yesterday1[{m-1}]={b}"
            else:
                lag_out[m] = a - b
                formulas[m] = f"Lag1_{m} = yesterday1[{m}]({a}) - yesterday1[{m-1}]({b}) = {lag_out[m]}"
        else:
            # m == 0: use yesterday2[23]
            a = _get_val(y1, 0)
            b = _get_val(y2, 23)
            if a is None or b is None:
                lag_out[0] = None
                formulas[0] = f"Lag1_0: missing operand(s) -> yesterday1[0]={a}, yesterday2[23]={b}"
            else:
                lag_out[0] = a - b
                formulas[0] = f"Lag1_0 = yesterday1[0]({a}) - yesterday2[23]({b}) = {lag_out[0]}"

    return ComputeLagResponse(lag=lag_out, formulas=formulas)


# Simple in-memory store for actuals (prototype)
actuals_store = {"today_hourly": [None] * 24}


class UpdateActual(BaseModel):
    hour: int
    value: float


@app.post("/update-actual")
def update_actual(u: UpdateActual):
    if 0 <= u.hour < 24:
        actuals_store["today_hourly"][u.hour] = float(u.value)
        return {"ok": True, "hour": u.hour, "value": u.value}
    return {"ok": False, "error": "hour must be 0..23"}


@app.get("/actuals")
def get_actuals():
    return {"today_hourly": actuals_store["today_hourly"]}
