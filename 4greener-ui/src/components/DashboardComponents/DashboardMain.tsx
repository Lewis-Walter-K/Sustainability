import React, { useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { LayoutDashboard, Activity, Bell, PlugZap, BarChart2, Info, Leaf, FileDown } from "lucide-react";
import { exportCSV, KPIGrid, Card, CardHeader, Container, Header } from "../FuncComponents/GeneralFunc";

class ChartBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message?: string }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(err: any) { return { hasError: true, message: String(err?.message || err) }; }
  componentDidCatch(err: any, info: any) { console.error('ChartBoundary', err, info); }
  render() { if (this.state.hasError) return <div className="p-4">Chart error: {this.state.message}</div>; return this.props.children as any; }
}

export function DashboardMain({ T, setRoute, dark }: { T: any; setRoute: (r: any) => void; dark: boolean }) {
  const now = new Date();
  const [hourlyData, setHourlyData] = useState<{ t: string; actual: number | null; pred: number | null }[]>(() => Array.from({ length: 24 }, (_, h) => ({ t: `${String(h).padStart(2, '0')}:00`, actual: null, pred: null })));
  const [loadingPred, setLoadingPred] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [editingActuals, setEditingActuals] = useState(false);
  const [editingYesters, setEditingYesters] = useState(false);

  const [actualInputs, setActualInputs] = useState<(number | null)[]>(() => Array(24).fill(null));
  const [yesterPresets, setYesterPresets] = useState<string[]>(() => []);
  const [actualPresets, setActualPresets] = useState<string[]>(() => []);

  const [editYesterday1, setEditYesterday1] = useState<(number | null)[] | null>(null);
  const [editYesterday2, setEditYesterday2] = useState<(number | null)[] | null>(null);
  const [yesterday1, setYesterday1] = useState<number[] | null>(null);
  const [yesterday2, setYesterday2] = useState<number[] | null>(null);
  const [lagArray, setLagArray] = useState<number[] | null>(null);
  const [dataSource, setDataSource] = useState<'app' | 'fallback' | 'error'>('fallback');

  React.useEffect(() => { if (typeof window !== 'undefined') { setYesterPresets(Object.keys(localStorage || {}).filter(k => k.startsWith('yester_preset_')).sort()); setActualPresets(Object.keys(localStorage || {}).filter(k => k.startsWith('actuals_preset_')).sort()); } }, []);

  function refreshYesterPresets() { if (typeof window === 'undefined') return; setYesterPresets(Object.keys(localStorage || {}).filter(k => k.startsWith('yester_preset_')).sort()); }
  function refreshActualPresets() { if (typeof window === 'undefined') return; setActualPresets(Object.keys(localStorage || {}).filter(k => k.startsWith('actuals_preset_')).sort()); }

  async function fetchPrediction(overrideLag?: number[]) {
    setLoadingPred(true); setServerMsg(null);
    try {
      const payload = { lag1: overrideLag ?? lagArray ?? Array(24).fill(0), lag1_total: 0, year: now.getFullYear(), day_of_week: now.getDay(), month: now.getMonth() + 1, individual_code: 0 };
      const res = await fetch('http://localhost:8000/predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(String(res.status));
      const jd = await res.json();
      const hourlyRaw = jd.hourly ?? [];
      setHourlyData(h => h.map((r, i) => {
        const v = hourlyRaw[i];
        if (v == null) return { ...r, pred: null };
        const n = Number(v);
        if (!Number.isFinite(n)) return { ...r, pred: null };
        const clamped = Math.max(0, n);
        const rounded = Math.round(clamped * 100) / 100;
        return { ...r, pred: rounded };
      }));
      setServerMsg('Prediction loaded');
    } catch (e:any) { console.error(e); setServerMsg(String(e?.message ?? e)); }
    finally { setLoadingPred(false); }
  }

  async function sendActual(hour: number, value: number) {
    try { const res = await fetch('http://localhost:8000/update-actual', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hour, value }) }); if (!res.ok) throw new Error(String(res.status)); await res.json(); setHourlyData(h => h.map((r,i) => i===hour?{...r,actual:value}:r)); } catch (e) { console.error(e); setServerMsg('Failed to send actual'); }
  }

  function importActualsCSV(text: string) {
    // Robust CSV parser: accept single-line CSV, multi-line CSV (one row), or multiline with one row per value.
    try {
      const rows = String(text || '').trim().split(/\r?\n/).map(r => r.trim()).filter(Boolean);
      let tokens: string[] = [];
      if (rows.length === 0) {
        setServerMsg('No data found in CSV');
        return;
      }
      // Prefer a row that has many comma-separated values
      for (const r of rows) {
        const parts = r.split(/,|\s+/).map(s => s.trim()).filter(Boolean);
        if (parts.length >= 24) { tokens = parts; break; }
      }
      // If none of the rows have >=24 columns, flatten all numeric tokens
      if (tokens.length === 0) {
        tokens = rows.flatMap(r => r.split(/,|\s+/).map(s => s.trim()).filter(Boolean));
      }
      const nums = tokens.slice(0, 24).map(p => { const n = Number(p); return Number.isFinite(n) ? n : null; });
      while (nums.length < 24) nums.push(null);
      console.debug('importActualsCSV -> parsed', nums);
      setActualInputs(nums);
      setServerMsg('CSV imported');
    } catch (err:any) {
      console.error('importActualsCSV error', err);
      setServerMsg('Failed to parse CSV');
    }
  }

  function savePreset(name: string) { localStorage.setItem(`actuals_preset_${name}`, JSON.stringify(actualInputs)); setServerMsg('Preset saved'); refreshActualPresets(); }
  function _coerceArrayToNumbers(arr: any): (number|null)[] {
    if (!Array.isArray(arr)) return Array(24).fill(null);
    const out: (number|null)[] = Array(24).fill(null);
    for (let i = 0; i < Math.min(24, arr.length); i++) {
      const v = arr[i];
      if (v == null || v === '') out[i] = null;
      else {
        const n = Number(v);
        out[i] = Number.isFinite(n) ? n : null;
      }
    }
    return out;
  }
  function loadPreset(name: string) { const raw = localStorage.getItem(`actuals_preset_${name}`); if (!raw) { setServerMsg('Preset not found'); return; } try { const parsed = JSON.parse(raw); setActualInputs(_coerceArrayToNumbers(parsed)); setServerMsg('Loaded'); } catch (e) { setServerMsg('Bad preset'); } }
  function saveYesterPreset(name: string) { const payload = { y1: editYesterday1, y2: editYesterday2 }; localStorage.setItem(`yester_preset_${name}`, JSON.stringify(payload)); refreshYesterPresets(); setServerMsg('Saved'); }
  function loadYesterPreset(name: string) { const raw = localStorage.getItem(`yester_preset_${name}`); if (!raw) { setServerMsg('Preset not found'); return; } try { const p = JSON.parse(raw); setEditYesterday1(_coerceArrayToNumbers(p.y1)); setEditYesterday2(_coerceArrayToNumbers(p.y2)); setServerMsg('Loaded'); } catch (e) { setServerMsg('Bad preset'); } }

  // metrics
  const actualVals = hourlyData.map(h => h.actual == null ? null : Number(h.actual));
  const predVals = hourlyData.map(h => h.pred == null ? null : Number(h.pred));
  const nowHour = now.getHours();
  const whNow = actualVals[nowHour] ?? predVals[nowHour] ?? 0;
  const sumActuals = actualVals.reduce<number>((s, v) => s + (v == null ? 0 : v), 0);
  const sumPredFuture = predVals.reduce<number>((s, p, i) => s + ((i >= nowHour && actualVals[i] == null && p != null) ? Number(p) : 0), 0);
  const whToday = Number((sumActuals + sumPredFuture).toFixed(3));
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const whMonth = Number(((whToday / Math.max(1, now.getDate())) * daysInMonth).toFixed(1));
  const whMonth_kWh = whMonth / 1000; const estCostVND = Math.round(whMonth_kWh * 2500); const estCO2kg = +(whMonth_kWh * 0.82).toFixed(1);

  const deviceBreakdown = [ { name: 'A/C', value: 72 }, { name: 'Fridge', value: 38 }, { name: 'Lighting', value: 22 }, { name: 'Laptop', value: 18 }, { name: 'Other', value: 15 } ];
  const hourOfDay = Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, '0')}:00`, kwh: +(0.22 + 0.18 * Math.sin((h / 24) * Math.PI * 2 + 0.6) + Math.max(0, (h - 19)) * 0.01).toFixed(2) }));
  const peakHour = hourOfDay.reduce((a, b) => (b.kwh > a.kwh ? b : a));
  const notifications = [ { id: 1, type: 'warning', text: 'Spike at 21:00 (+34%). Delay laundry 1h.' }, { id: 2, type: 'success', text: 'On track: −6% vs daily goal.' }, { id: 3, type: 'info', text: 'Tip: Enable A/C Eco at night.' } ];
  const anomalies = [ { t: '21:00', delta: '+34%', note: 'Laundry + A/C overlap' }, { t: '06:30', delta: '+18%', note: 'Morning kettle peak' } ];

  return (
    <Container className="py-6">
      <Header title={T.dashboard} subtitle="Real-time overview & key insights" icon={<LayoutDashboard className="h-5 w-5"/>} T={T} />
      <KPIGrid T={T} kwhNow={whNow} kwhToday={whToday} kwhMonth={whMonth} />

      <div className="mt-6 grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Last 24 hours – Actual vs Predicted" subtitle="1-hour resolution" icon={<Activity className="h-4 w-4"/>} />
          <div className="h-64 w-full">
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-slate-500">Model: local FastAPI (http://localhost:8000)</div>
              <div className="flex gap-2">
                <button className="rounded-2xl border bg-white px-3 py-2 text-sm" onClick={() => { setEditingYesters(true); }}>Edit Yesterday</button>
                <button className="rounded-2xl border bg-white px-3 py-2 text-sm" onClick={() => { setEditingActuals(v => !v); }}>{editingActuals ? 'Close actuals' : 'Edit actuals'}</button>
                <button className="rounded-2xl border bg-white px-3 py-2 text-sm" onClick={() => void fetchPrediction()}>{loadingPred ? 'Predicting...' : 'Predict today'}</button>
                <button className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white" onClick={() => setRoute('devices')}>{T.devices}</button>
              </div>
            </div>
            {serverMsg && <div className="px-2 pt-2 text-xs text-slate-500">{serverMsg}</div>}
            <ChartBoundary>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, "dataMax + 0.1"]} label={{ value: "Wh", angle: -90, position: "insideLeft", offset: 10 }} />
                  <Tooltip formatter={(v: any) => `${v} Wh`} />
                  <Legend />
                  <Line type="monotone" dataKey="actual" name={T.actual} strokeWidth={3} stroke="#10b981" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="pred" name={T.predicted} strokeWidth={2} stroke="#2563eb" dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </ChartBoundary>
          </div>

          {editingActuals && (
            <div className="mt-3 rounded-xl border bg-slate-50 p-3 dark:bg-slate-800">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium">Edit hourly actuals</div>
                <div className="text-xs text-slate-500">Enter Wh per hour</div>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {hourlyData.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-14 text-xs">{h.t}</div>
                    <input inputMode="decimal" type="number" step="0.001" className="w-20 rounded border bg-white px-2 py-1 text-sm dark:bg-slate-700" value={actualInputs[i] == null ? '' : String(actualInputs[i])} onChange={e => { const vRaw = e.target.value; const v = vRaw === '' ? null : Number(vRaw); setActualInputs(s => { const n = s.slice(); n[i] = v; return n; }); }} />
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <button className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white" onClick={async () => {
                  const updates: Promise<any>[] = [];
                  const newHourly = hourlyData.map(h => ({ ...h }));
                  for (let i = 0; i < actualInputs.length; i++) { const v = actualInputs[i]; if (v == null) continue; const numV = Number(v); if (!Number.isFinite(numV)) continue; newHourly[i] = { ...newHourly[i], actual: numV }; updates.push(fetch('http://localhost:8000/update-actual', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hour: i, value: v }) }).then(async res => { if (!res.ok) throw new Error(String(res.status)); return await res.json(); })); }
                  setHourlyData(newHourly);
                  try { await Promise.all(updates); setServerMsg('Actuals submitted'); } catch (e) { console.error(e); setServerMsg('Some updates failed'); } finally { setEditingActuals(false); }
                }}>Submit actuals</button>
                <button className="rounded-2xl border px-3 py-2 text-sm" onClick={() => { setEditingActuals(false); setServerMsg(null); }}>Cancel</button>
                <label className="rounded-2xl border px-3 py-2 text-sm cursor-pointer">Import CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const reader = new FileReader(); reader.onload = ev => importActualsCSV(String(ev.target?.result ?? '')); reader.readAsText(f); (e.target as HTMLInputElement).value = ''; }} /></label>

                <label className="rounded-2xl border px-3 py-2 text-sm cursor-pointer">Load actuals CSV (batch)
                  <input type="file" accept=".csv,text/csv" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]; if (!f) return;
                    const reader = new FileReader();
                    reader.onload = ev => {
                      try {
                        const txt = String(ev.target?.result ?? '');
                        const rows = txt.split(/\r?\n/).map(r => r.trim()).filter(r => r.length > 0);
                        // skip header rows like "0;1;2;..."
                        const cleaned = rows.filter(r => {
                          const parts = r.split(/[;,\s]+/).map(s => s.trim()).filter(Boolean);
                          const isHeader = parts.length >= 24 && parts.every((p, idx) => String(idx) === p);
                          return !isHeader;
                        });
                        let firstOut: (number|null)[] | null = null;
                        for (let i = 0; i < cleaned.length; i++) {
                          const parts = cleaned[i].split(/[;,\s]+/).map(s => s.trim());
                          const out: (number | null)[] = [];
                          for (let k = 0; k < 24; k++) { const v = parts[k]; if (v == null || v === '' || v.toLowerCase() === 'nan') out.push(null); else { const n = Number(v); out.push(Number.isFinite(n) ? n : null); } }
                          localStorage.setItem(`actuals_preset_test${i+1}`, JSON.stringify(out));
                          if (i === 0) firstOut = out;
                        }
                        refreshActualPresets();
                        if (firstOut) { setActualInputs(firstOut); setEditingActuals(true); }
                        setServerMsg(`Saved ${cleaned.length} actual presets`);
                      } catch (err:any) { console.error(err); setServerMsg('Failed to parse'); }
                    };
                    reader.readAsText(f); (e.target as HTMLInputElement).value = '';
                  }} />
                </label>

                <div className="ml-2 flex items-center gap-2">
                  <input placeholder="preset name" className="rounded border px-2 py-1 text-sm" id="presetName" />
                  <button className="rounded-2xl border px-3 py-2 text-sm" onClick={() => { const el:any = document.getElementById('presetName'); const name = el?.value?.trim(); if (!name) { setServerMsg('Enter name'); return; } savePreset(name); }}>Save preset</button>
                  <button className="rounded-2xl border px-3 py-2 text-sm" onClick={() => { const el:any = document.getElementById('presetName'); const name = el?.value?.trim(); if (!name) { setServerMsg('Enter name'); return; } loadPreset(name); }}>Load preset</button>
                </div>

                <div className="mt-2 max-h-40 overflow-auto rounded border bg-white p-2 text-xs">
                  <div className="font-medium mb-1">Saved actual presets</div>
                  {actualPresets.length === 0 && <div className="text-slate-500">No presets</div>}
                  {actualPresets.map(k => (
                    <div key={k} className="flex items-center justify-between gap-2 py-1">
                      <div className="truncate">{k.replace(/^actuals_preset_/, '')}</div>
                      <div className="flex gap-1">
                        <button className="rounded px-2 py-1 border text-xs" onClick={() => { const raw = localStorage.getItem(k); if (!raw) { setServerMsg('not found'); return; } try { const parsed = JSON.parse(raw); setActualInputs(_coerceArrayToNumbers(parsed)); setServerMsg('Loaded'); } catch (e) { setServerMsg('Bad'); } }}>Load</button>
                        <button className="rounded px-2 py-1 border text-xs" onClick={() => { localStorage.removeItem(k); refreshActualPresets(); setServerMsg('Deleted'); }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

          {editingYesters && (
            <div className="mt-3 rounded-xl border bg-slate-50 p-3 dark:bg-slate-800">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium">Edit Yesterday1 / Yesterday2</div>
                <div className="text-xs text-slate-500">Enter 24 values for each</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium mb-1">Yesterday1</div>
                  <div className="grid grid-cols-6 gap-2">{(editYesterday1 ?? Array(24).fill(null)).map((v,i)=> (<input key={i} inputMode="decimal" type="number" step="0.001" className="w-full rounded border bg-white px-2 py-1 text-sm dark:bg-slate-700" value={v==null? '': String(v)} onChange={e=>{ const nv = e.target.value===''? null: Number(e.target.value); setEditYesterday1(s=>{ const arr = s? s.slice(): Array(24).fill(null); arr[i]=nv; return arr; }); }} />))}</div>
                </div>
                <div>
                  <div className="text-xs font-medium mb-1">Yesterday2</div>
                  <div className="grid grid-cols-6 gap-2">{(editYesterday2 ?? Array(24).fill(null)).map((v,i)=> (<input key={i} inputMode="decimal" type="number" step="0.001" className="w-full rounded border bg-white px-2 py-1 text-sm dark:bg-slate-700" value={v==null? '': String(v)} onChange={e=>{ const nv = e.target.value===''? null: Number(e.target.value); setEditYesterday2(s=>{ const arr = s? s.slice(): Array(24).fill(null); arr[i]=nv; return arr; }); }} />))}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <input placeholder="preset name" className="rounded border px-2 py-1 text-sm" id="yesterPresetName" />
                <button className="rounded-2xl border px-3 py-2 text-sm" onClick={() => { const el:any = document.getElementById('yesterPresetName'); const name = el?.value?.trim(); if (!name) { setServerMsg('Enter name'); return; } saveYesterPreset(name); }}>Save preset</button>
                <button className="rounded-2xl border px-3 py-2 text-sm" onClick={() => { const el:any = document.getElementById('yesterPresetName'); const name = el?.value?.trim(); if (!name) { setServerMsg('Enter name'); return; } loadYesterPreset(name); }}>Load preset</button>
                <label className="rounded-2xl border px-3 py-2 text-sm cursor-pointer">Load from CSV
                  <input type="file" accept=".csv,text/csv" className="hidden" onChange={e=>{
                    const f = e.target.files?.[0]; if (!f) return;
                    const reader = new FileReader();
                    reader.onload = ev => {
                      try {
                        const txt = String(ev.target?.result ?? '');
                        const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
                        // skip header rows that look like "0;1;2;..."
                        const cleaned = lines.filter(l => {
                          const parts = l.split(/[;,\s]+/).map(s => s.trim()).filter(Boolean);
                          const isHeader = parts.length >= 24 && parts.every((p, idx) => String(idx) === p);
                          return !isHeader;
                        });
                        const pairs = Math.floor(cleaned.length / 2);
                        for (let i = 0; i < pairs; i++) {
                          const r2 = cleaned[2*i].split(/[;,\s]+/).map(s => s.trim());
                          const r1 = cleaned[2*i+1].split(/[;,\s]+/).map(s => s.trim());
                          const parseRow = (r: string[]) => {
                            const out: (number|null)[] = [];
                            for (let k = 0; k < 24; k++) {
                              const v = r[k];
                              if (v == null || v === '' || v.toLowerCase() === 'nan') out.push(null);
                              else { const n = Number(v); out.push(Number.isFinite(n) ? n : null); }
                            }
                            return out;
                          };
                          const y2 = parseRow(r2);
                          const y1 = parseRow(r1);
                          localStorage.setItem(`yester_preset_test${i+1}`, JSON.stringify({ y1, y2 }));
                        }
                        refreshYesterPresets();
                        setServerMsg(`Saved ${pairs} presets`);
                      } catch (err:any) {
                        console.error(err);
                        setServerMsg('Failed');
                      }
                    };
                    reader.readAsText(f);
                    (e.target as HTMLInputElement).value = '';
                  }} />
                </label>
                <button className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white" onClick={async () => {
                  const y1 = editYesterday1 ?? Array(24).fill(null); const y2 = editYesterday2 ?? Array(24).fill(null);
                  try { const resp = await fetch('http://localhost:8000/compute-lag', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ yesterday1: y1, yesterday2: y2 }) }); if (!resp.ok) throw new Error(String(resp.status)); const jd = await resp.json(); const lagRes = jd.lag ?? Array(24).fill(null); const override: number[] = lagRes.map((v:any,i:number)=>v==null?(lagArray?.[i]??0):Number(v)); setLagArray(override); await fetchPrediction(override); setEditingYesters(false); setServerMsg('Computed lag and predicted'); } catch(e:any){ console.error(e); setServerMsg(String(e?.message ?? e)); }
                }}>Compute & Predict</button>
                <button className="rounded-2xl border px-3 py-2 text-sm" onClick={() => { setEditingYesters(false); setEditYesterday1(null); setEditYesterday2(null); }}>Cancel</button>
              </div>

              <div className="mt-2 max-h-40 overflow-auto rounded border bg-white p-2 text-xs">
                <div className="font-medium mb-1">Saved yesterday presets</div>
                {yesterPresets.length === 0 && <div className="text-slate-500">No presets</div>}
                {yesterPresets.map(k => (
                  <div key={k} className="flex items-center justify-between gap-2 py-1">
                    <div className="truncate">{k.replace(/^yester_preset_/, '')}</div>
                    <div className="flex gap-1">
                      <button className="rounded px-2 py-1 border text-xs" onClick={() => { const raw = localStorage.getItem(k); if (!raw) { setServerMsg('not found'); return; } try { const p = JSON.parse(raw); setEditYesterday2(_coerceArrayToNumbers(p.y2)); setEditYesterday1(_coerceArrayToNumbers(p.y1)); setServerMsg('Loaded'); } catch (e) { setServerMsg('Bad'); } }}>Load</button>
                      <button className="rounded px-2 py-1 border text-xs" onClick={() => { localStorage.removeItem(k); refreshYesterPresets(); setServerMsg('Deleted'); }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader title={T.breakdown} subtitle="Share of monthly kWh (mock)" icon={<PlugZap className="h-4 w-4"/>} />
          <div className="h-56 w-full">
            <ChartBoundary>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deviceBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>{deviceBreakdown.map((_, i) => (<Cell key={i}/>))}</Pie>
                  <Tooltip formatter={(v:any,n:any)=>[`${v} Wh`, n]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartBoundary>
          </div>
        </Card>

        <Card>
          <CardHeader title={T.hod} subtitle={`Peak: ${peakHour.hour} (${peakHour.kwh} Wh)`} icon={<BarChart2 className="h-4 w-4"/>} />
          <div className="h-56 w-full">
            <ChartBoundary>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourOfDay} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" interval={3} />
                  <YAxis domain={[0, "dataMax + 0.1"]} />
                  <Tooltip />
                  <Bar dataKey="kwh" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartBoundary>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title={T.alerts} subtitle="Automated suggestions" icon={<Bell className="h-4 w-4"/>} />
          <ul className="space-y-2 text-sm">{notifications.map(n => (<li key={n.id} className={`rounded-xl p-3 ${n.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/30' : n.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-sky-50 dark:bg-sky-900/30'}`}>{n.text}</li>))}</ul>
          <div className="mt-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Info className="h-4 w-4"/>{T.anomalies}</h4>
            <ul className="space-y-1 text-xs">{anomalies.map((a,i)=>(<li key={i} className="flex items-center justify-between rounded-xl bg-slate-50 p-2 dark:bg-slate-800"><span>{a.t}</span><span className="font-medium">{a.delta}</span><span className="text-slate-500">{a.note}</span></li>))}</ul>
            <div className="mt-3 flex gap-2"><button className="rounded-2xl border bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-800" onClick={() => setRoute('compare')}>Benchmark</button><button className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white shadow-sm" onClick={() => setRoute('devices')}>{T.devices}</button></div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title={T.costCo2} subtitle="Estimates for this month (mock)" icon={<Leaf className="h-4 w-4"/>} />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><div className="flex items-center gap-3"><div className="text-sm text-slate-500">Model: local FastAPI (http://localhost:8000)</div><div className="text-xs px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: dataSource === 'app' ? '#dcfce7' : dataSource === 'fallback' ? '#f1f5f9' : '#fee2e2', color: dataSource === 'app' ? '#065f46' : dataSource === 'fallback' ? '#0f172a' : '#7f1d1d' }}>{dataSource === 'app' ? 'Loaded from app.py' : dataSource === 'fallback' ? 'Fallback data' : 'Data load error'}</div></div><div className="text-2xl font-semibold">{estCostVND.toLocaleString()} {T.currency}</div></div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><div className="text-slate-500">CO₂</div><div className="text-2xl font-semibold">{estCO2kg} kg</div></div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Assumes 2,500 VND/kWh and 0.82 kg CO₂/kWh.</p>
        </Card>
        <Card>
          <CardHeader title="Quick actions" subtitle="Export / Share" icon={<FileDown className="h-4 w-4"/>} />
          <div className="flex flex-wrap gap-2"><button className="rounded-2xl border bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-800" onClick={() => exportCSV(hourlyData, 'hourly.csv')}>{T.export} (CSV)</button><button className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white shadow-sm">{T.share}</button></div>
        </Card>
      </div>
    </Container>
  );
}

