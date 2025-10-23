"""Batch predict script
Reads `toread.csv` (each pair of rows = one test case: first row = yesterday2, second row = yesterday1)
Optional `actualtest.csv` where each row is the true today's hourly values for the corresponding test case.

For each test case the script:
 - posts to /compute-lag to compute lag vector
 - posts to /predict to get predicted 24 hourly values
 - optionally compares to actuals and computes MAE/MAPE and totals
 - saves per-case JSON presets (y1,y2) into ./output/presets and writes a summary CSV

Usage (PowerShell):
  python .\predict_from_csv.py --server http://localhost:8000 --toread toread.csv --actuals actualtest.csv

If the server is not running the script will still parse the CSVs and write presets.
"""

import argparse
import os
import json
from typing import List, Optional

import pandas as pd
import numpy as np

try:
    import requests
except Exception:
    requests = None


def read_row_values(row) -> List[Optional[float]]:
    # take first 24 numeric columns/cells, coerce non-numeric to None
    vals = []
    for v in row[:24]:
        try:
            if pd.isna(v):
                vals.append(None)
            else:
                vals.append(float(v))
        except Exception:
            vals.append(None)
    # pad if shorter
    while len(vals) < 24:
        vals.append(None)
    return vals


def post_compute_lag(server_url: str, y1: List[Optional[float]], y2: List[Optional[float]]):
    url = server_url.rstrip('/') + '/compute-lag'
    if requests is None:
        raise RuntimeError('requests library not available')
    resp = requests.post(url, json={'yesterday1': y1, 'yesterday2': y2}, timeout=30)
    resp.raise_for_status()
    return resp.json()


def post_predict(server_url: str, lag: List[float], year: int, day_of_week: int, month: int, individual_code: int = 0):
    url = server_url.rstrip('/') + '/predict'
    if requests is None:
        raise RuntimeError('requests library not available')
    payload = {
        'lag1': lag,
        'lag1_total': sum(abs(x) for x in lag),
        'year': year,
        'day_of_week': day_of_week,
        'month': month,
        'individual_code': individual_code
    }
    resp = requests.post(url, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()


def ensure_output_dirs(base: str):
    presets_dir = os.path.join(base, 'presets')
    os.makedirs(presets_dir, exist_ok=True)
    return presets_dir


def save_preset_file(presets_dir: str, idx: int, y1: List[Optional[float]], y2: List[Optional[float]]):
    payload = {'y1': y1, 'y2': y2}
    fname = os.path.join(presets_dir, f'yester_preset_{idx:03d}.json')
    with open(fname, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2)
    return fname


def compute_errors(pred: List[Optional[float]], actual: List[Optional[float]]):
    # compute MAE and MAPE over positions where actual is present
    preds = []
    reals = []
    for p, a in zip(pred, actual):
        if a is None:
            continue
        if p is None:
            continue
        preds.append(float(p))
        reals.append(float(a))
    if len(reals) == 0:
        return None, None
    preds = np.array(preds)
    reals = np.array(reals)
    mae = float(np.mean(np.abs(preds - reals)))
    # MAPE guard: avoid division by zero; only compute where real != 0
    nonzero = reals != 0
    if nonzero.any():
        mape = float(np.mean(np.abs((preds[nonzero] - reals[nonzero]) / reals[nonzero])) * 100.0)
    else:
        mape = None
    return mae, mape


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--server', default='http://localhost:8000', help='Model server base URL')
    p.add_argument('--toread', default='toread.csv', help='CSV with pairs of rows (yesterday2,yesterday1)')
    p.add_argument('--actuals', default=None, help='CSV with actuals per test case (one row per case)')
    p.add_argument('--outdir', default='output', help='Output folder for presets and results')
    p.add_argument('--dry-run', action='store_true', help='Do not call HTTP endpoints, only parse and save presets')
    args = p.parse_args()

    # read toread.csv
    if not os.path.exists(args.toread):
        print(f"ERROR: {args.toread} not found in working directory {os.getcwd()}")
        return
    df = pd.read_csv(args.toread, header=None)
    n_rows = len(df)
    if n_rows % 2 != 0:
        print(f"Warning: {args.toread} has odd number of rows ({n_rows}), last row will be ignored")
    n_cases = n_rows // 2
    print(f"Found {n_cases} test cases in {args.toread}")

    actual_df = None
    if args.actuals:
        if not os.path.exists(args.actuals):
            print(f"Warning: actuals file {args.actuals} not found, continuing without actuals")
            args.actuals = None
        else:
            actual_df = pd.read_csv(args.actuals, header=None)
            if len(actual_df) < n_cases:
                print(f"Warning: actuals has {len(actual_df)} rows but {n_cases} cases expected")

    os.makedirs(args.outdir, exist_ok=True)
    presets_dir = ensure_output_dirs(args.outdir)

    results = []

    from datetime import datetime
    now = datetime.now()
    year = now.year
    day_of_week = now.weekday()  # Monday=0
    month = now.month

    for ci in range(n_cases):
        r2 = df.iloc[ci*2 + 0].tolist()
        r1 = df.iloc[ci*2 + 1].tolist()
        y2 = read_row_values(r2)
        y1 = read_row_values(r1)
        preset_path = save_preset_file(presets_dir, ci+1, y1, y2)
        print(f"Case {ci+1:03d}: saved preset -> {preset_path}")

        pred_hourly = None
        pred_total = None
        mae = None
        mape = None

        if not args.dry_run and requests is not None:
            try:
                # call compute-lag
                cl = post_compute_lag(args.server, y1, y2)
                lag = cl.get('lag') or [0.0]*24
                # fill nulls with zeros
                lag_filled = [0.0 if v is None else float(v) for v in lag]
                # call predict
                pr = post_predict(args.server, lag_filled, year, day_of_week, month)
                pred_hourly = pr.get('hourly')
                pred_total = pr.get('total')
                print(f"  - predicted total={pred_total}")
            except Exception as e:
                print(f"  - HTTP error for case {ci+1}: {e}")

        # compare to actuals if provided
        actual_row = None
        if actual_df is not None and ci < len(actual_df):
            actual_row = read_row_values(actual_df.iloc[ci].tolist())
            if pred_hourly is not None:
                mae, mape = compute_errors(pred_hourly, actual_row)
                print(f"  - MAE={mae}, MAPE={mape}")

        results.append({
            'case': ci+1,
            'preset_file': preset_path,
            'pred_total': pred_total,
            'mae': mae,
            'mape': mape,
            'pred_hourly': pred_hourly,
            'actual_hourly': actual_row
        })

    # write summary CSV and JSON
    summary_csv = os.path.join(args.outdir, 'predictions_summary.csv')
    cols = ['case','preset_file','pred_total','mae','mape']
    rows = [{k: r.get(k) for k in cols} for r in results]
    pd.DataFrame(rows).to_csv(summary_csv, index=False)
    with open(os.path.join(args.outdir, 'predictions_detail.json'), 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)

    print('\nDone. Outputs:')
    print(' - presets in', presets_dir)
    print(' - summary CSV:', summary_csv)
    print(' - detail JSON:', os.path.join(args.outdir, 'predictions_detail.json'))
    print('\nTo load a preset into the dashboard Edit Yesterday UI: open the JSON file and copy the object into localStorage using:')
    print("  localStorage.setItem('yester_preset_<name>', JSON.stringify({y1: [...], y2: [...]}))")

if __name__ == '__main__':
    main()
