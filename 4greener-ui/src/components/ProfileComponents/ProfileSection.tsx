import React, { useMemo, useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, AreaChart, Area, BarChart, Bar } from "recharts";
import { User, BarChart2, Gauge, FileDown, PlugZap } from "lucide-react";
import { exportCSV, Container, Header, Card, CardHeader, SegmentedControl, Row } from "../FuncComponents/GeneralFunc.tsx";
import { titleFrom, subtitleFrom } from "./ProfileFunc.tsx";

// Local, lightweight UI helpers so this file is self-contained and can be
// rendered directly by App without depending on every export from GeneralFunc.

class ChartBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message?: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, message: undefined };
  }
  static getDerivedStateFromError(err: any) {
    return { hasError: true, message: String(err?.message || err) };
  }
  componentDidCatch(err: any, info: any) {
    console.error("ChartBoundary caught: ", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center rounded-xl border bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Chart failed to render. Try resizing the window or toggling the series.
          {this.state.message}
        </div>
      );
    }
    return this.props.children as any;
  }
}

export function ProfileMain({ T, setRoute, dark }: { T: any; setRoute: (r: any) => void; dark: boolean }) {
  const [predictionView, setPredictionView] = useState<"hour" | "day" | "month">("hour");
  const [showActual, setShowActual] = useState(true);
  const [showPred, setShowPred] = useState(true);
  const [dayHistory, setDayHistory] = useState<{ date: string; pred_total: number; actual_total: number }[]>([]);

  const now = new Date();
  const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const hourlyData = useMemo(() => {
    const rows: { t: string; actual: number; pred: number }[] = [];
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const base = 0.35 + 0.25 * Math.sin((d.getHours() / 24) * Math.PI * 2 + 0.6);
      const noise = (Math.random() - 0.5) * 0.08;
      const actual = Math.max(0.12, base + noise);
      const pred = Math.max(0.12, base * (1 + 0.03 * Math.sin(i)));
      rows.push({ t: fmtTime(d), actual: +actual.toFixed(3), pred: +pred.toFixed(3) });
    }
    return rows;
  }, []);

  const dailyData = useMemo(() => {
    const rows: { d: string; actual: number; pred: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const base = 8 + 2.5 * Math.sin((d.getDate() / 30) * Math.PI * 2 + 0.9);
      const actual = Math.max(3, base + (Math.random() - 0.5) * 1.2);
      const pred = Math.max(3, base * (1 + 0.02 * Math.sin(i)));
      rows.push({ d: d.toLocaleDateString(), actual: +actual.toFixed(2), pred: +pred.toFixed(2) });
    }
    return rows;
  }, []);

  const monthlyData = useMemo(() => {
    const rows: { m: string; actual: number; pred: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const base = 190 + 25 * Math.sin((d.getMonth() / 12) * Math.PI * 2 + 0.3);
      const actual = Math.max(120, base + (Math.random() - 0.5) * 20);
      const pred = Math.max(120, base * (1 + 0.015 * Math.sin(i)));
      rows.push({ m: d.toLocaleDateString(undefined, { month: "short" }), actual: Math.round(actual), pred: Math.round(pred) });
    }
    return rows;
  }, []);

  // Load saved day history (max 7 days) from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('profile_day_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setDayHistory(parsed.slice(-7).reverse());
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  function saveEndOfDay(pred_total: number, actual_total: number) {
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString();
      const entry = { date: dateStr, pred_total: +pred_total.toFixed(2), actual_total: +actual_total.toFixed(2) };
      const raw = localStorage.getItem('profile_day_history');
      let list: any[] = raw ? JSON.parse(raw) : [];
      // append and keep most recent last
      list.push(entry);
      // keep only last 7 days
      if (list.length > 7) list = list.slice(-7);
      localStorage.setItem('profile_day_history', JSON.stringify(list));
      // update state for immediate UI feedback (reverse so newest first)
      setDayHistory(list.slice().reverse());
    } catch (e) {
      console.error('Failed to save day history', e);
    }
  }

  return (
    <Container className="py-6">
      <Header title={T.profile} subtitle="Usage trend & predictions" icon={<User className="h-5 w-5"/>} T={T} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SegmentedControl
          value={predictionView}
          onChange={(v: string) => setPredictionView(v as any)}
          options={[
            { value: "hour", label: T.nextHour },
            { value: "day", label: T.dayPred },
            { value: "month", label: T.monthPred },
          ]}
        />
        <div className="ml-2">
          <button
            className="rounded-2xl border bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-800"
            title="End day: save today's prediction and actual into Profile Day history"
            onClick={() => {
              // compute totals: prefer dailyData[29] as 'today' if using mock daily, else sum hourlyData
              let pred_total = 0;
              let actual_total = 0;
              try {
                // if dayHistory should represent 'today', derive from hourlyData (last 24 entries)
                actual_total = dailyData[dailyData.length - 1]?.actual ?? 0;
                pred_total = dailyData[dailyData.length - 1]?.pred ?? 0;
                // fallback: sum hourly
                if (!pred_total || !actual_total) {
                  actual_total = hourlyData.reduce((s, r) => s + (r.actual || 0), 0);
                  pred_total = hourlyData.reduce((s, r) => s + (r.pred || 0), 0);
                }
              } catch (e) {
                actual_total = hourlyData.reduce((s, r) => s + (r.actual || 0), 0);
                pred_total = hourlyData.reduce((s, r) => s + (r.pred || 0), 0);
              }
              saveEndOfDay(pred_total, actual_total);
            }}
          >
            End day
          </button>
        </div>
        <div className="ml-auto flex items-center gap-3 rounded-2xl border bg-white px-3 py-2 shadow-sm dark:bg-slate-800">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showActual} onChange={(e)=>setShowActual(e.target.checked)} /> {T.actual}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showPred} onChange={(e)=>setShowPred(e.target.checked)} /> {T.predicted}</label>
        </div>
      </div>

      <Card>
        <CardHeader title={titleFrom(predictionView)} subtitle={subtitleFrom(predictionView)} icon={<BarChart2 className="h-4 w-4"/>} />
        <div className="h-72 w-full">
          <ChartBoundary>
            <ResponsiveContainer width="100%" height="100%">
              {predictionView === "hour" ? (
                <LineChart data={hourlyData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" />
                  <YAxis label={{ value: "kWh", angle: -90, position: "insideLeft", offset: 10 }} />
                  <Tooltip formatter={(v: any) => `${v} kWh`} />
                  <Legend />
                  <Line type="monotone" dataKey="actual" name={T.actual} strokeWidth={2} dot={false} hide={!showActual} />
                  <Line type="monotone" dataKey="pred" name={T.predicted} strokeWidth={2} strokeDasharray="4 2" dot={false} hide={!showPred} />
                </LineChart>
              ) : predictionView === "day" ? (
                <BarChart data={dayHistory.length ? dayHistory.map(d=>({d: d.date, actual: d.actual_total, pred: d.pred_total})) : dailyData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="d" />
                  <YAxis label={{ value: "kWh/day", angle: -90, position: "insideLeft", offset: 10 }} />
                  <Tooltip formatter={(v: any) => `${v} kWh`} />
                  <Legend />
                  <Bar dataKey="actual" name={T.actual} radius={[8,8,0,0]} hide={!showActual} />
                  <Bar dataKey="pred" name={T.predicted} radius={[8,8,0,0]} hide={!showPred} />
                </BarChart>
              ) : (
                <AreaChart data={monthlyData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="m" />
                  <YAxis label={{ value: "kWh/month", angle: -90, position: "insideLeft", offset: 10 }} />
                  <Tooltip formatter={(v: any) => `${v} kWh`} />
                  <Legend />
                  <Area type="monotone" dataKey="actual" name={T.actual} strokeWidth={2} fillOpacity={0.15} hide={!showActual} />
                  <Area type="monotone" dataKey="pred" name={T.predicted} strokeWidth={2} fillOpacity={0.15} hide={!showPred} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </ChartBoundary>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader title={T.account} subtitle="Khang • Student" icon={<User className="h-4 w-4"/>} />
          <div className="space-y-2 text-sm">
            <Row label="Email" value="khang@example.edu.vn" />
            <Row label="Room" value="2B-316 (Dorm 2)" />
            <Row label={T.plan} value="Student – Basic" />
          </div>
        </Card>
        <Card>
          <CardHeader title={T.modelMetrics} subtitle="Forecast quality (mock)" icon={<Gauge className="h-4 w-4"/>} />
          <div className="space-y-2 text-sm">
            <Row label="MAPE (24h)" value="7.4%" />
            <Row label="MAE (kWh)" value="0.028" />
            <Row label="Next hour forecast" value={`${(hourlyData[23]?.pred ?? 0.32).toFixed(3)} kWh`} />
          </div>
        </Card>
        <Card>
          <CardHeader title={T.goals} subtitle="Budget & target" icon={<Gauge className="h-4 w-4"/>} />
          <div className="space-y-2 text-sm">
            <Row label={T.budget} value={`500,000 ${T.currency}`} />
            <Row label={T.target} value="≤ 180 kWh/month" />
            <Row label={T.co2} value="−20% vs baseline" />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title={T.tariff} subtitle="TOU demo (mock)" icon={<PlugZap className="h-4 w-4"/>} />
          <div className="text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><span>Off-peak</span><span>1,800 VND/kWh</span></div>
            <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><span>Mid-peak</span><span>2,300 VND/kWh</span></div>
            <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><span>On-peak</span><span>3,200 VND/kWh</span></div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Quick actions" subtitle="Export / Share" icon={<FileDown className="h-4 w-4"/>} />
          <div className="flex flex-wrap gap-2">
            <button className="rounded-2xl border bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-800" onClick={() => exportCSV(hourlyData, "hourly.csv")}>{T.export} (CSV)</button>
            <button className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white shadow-sm">{T.share}</button>
          </div>
        </Card>
      </div>
    </Container>
  );
}

// small helpers used by this component but defined in GeneralFunc; we declare minimal stubs so TypeScript can find them if GeneralFunc is temporarily broken.
