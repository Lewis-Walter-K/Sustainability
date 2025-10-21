import React, { useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { LayoutDashboard, Activity, Bell, PlugZap, BarChart2, Info, Leaf, FileDown } from "lucide-react";
import { exportCSV, KPIGrid, Card, CardHeader, Container, Header } from "../FuncComponents/GeneralFunc";
import { heatColor } from "./DashboardFunc";

// Self-contained small helpers copied from App.tsx so this component can be imported
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
export function DashboardMain({ T, setRoute, dark }: { T: any; setRoute: (r: any) => void; dark: boolean }) {
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

  const deviceBreakdown = [
    { name: "A/C", value: 72 },
    { name: "Fridge", value: 38 },
    { name: "Lighting", value: 22 },
    { name: "Laptop", value: 18 },
    { name: "Other", value: 15 },
  ];

  const hourOfDay = Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, "0")}:00`, kwh: +(0.22 + 0.18 * Math.sin((h / 24) * Math.PI * 2 + 0.6) + Math.max(0, (h - 19)) * 0.01).toFixed(2) }));

  const weekHeat = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 2 }, (_, h) => 0.2 + 0.7 * Math.max(0, Math.sin((h / 24) * Math.PI * 2 + d * 0.4)))
  );

  const kwhNow = hourlyData[hourlyData.length - 1]?.actual ?? 0.32;
  const kwhToday = 9.8;
  const kwhMonth = 205;

  const estCostVND = Math.round(kwhMonth * 2500);
  const estCO2kg = +(kwhMonth * 0.82).toFixed(1);
  const peakHour = hourOfDay.reduce((a, b) => (b.kwh > a.kwh ? b : a));

  const notifications = [
    { id: 1, type: "warning", text: "Spike at 21:00 (+34%). Delay laundry 1h." },
    { id: 2, type: "success", text: "On track: −6% vs daily goal." },
    { id: 3, type: "info", text: "Tip: Enable A/C Eco at night." },
  ];

  const anomalies = [
    { t: "21:00", delta: "+34%", note: "Laundry + A/C overlap" },
    { t: "06:30", delta: "+18%", note: "Morning kettle peak" },
  ];

  return (
    <Container className="py-6">
      <Header title={T.dashboard} subtitle="Real-time overview & key insights" icon={<LayoutDashboard className="h-5 w-5"/>} T={T} />
      <KPIGrid T={T} kwhNow={kwhNow} kwhToday={kwhToday} kwhMonth={kwhMonth} />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Last 24 hours – Actual vs Predicted" subtitle="1-hour resolution" icon={<Activity className="h-4 w-4"/>} />
          <div className="h-64 w-full">
            <ChartBoundary>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ left: 8, right: 8 }}>
                  <defs>
                    <linearGradient id="g1a" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopOpacity={0.25} stopColor="#0ea5e9" />
                      <stop offset="95%" stopOpacity={0} stopColor="#0ea5e9" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, "auto"]} label={{ value: "kWh", angle: -90, position: "insideLeft", offset: 10 }} />
                  <Tooltip formatter={(v: any) => `${v} kWh`} />
                  <Legend />
                  <Area type="monotone" dataKey="actual" name={T.actual} strokeWidth={2} fillOpacity={0.25} fill="url(#g1a)" />
                  <Line type="monotone" dataKey="pred" name={T.predicted} strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBoundary>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">Model note: AR + seasonality; error(MAPE)≈6–9% (mock).</div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title={T.alerts} subtitle="Automated suggestions" icon={<Bell className="h-4 w-4"/>} />
          <ul className="space-y-2 text-sm">
            {notifications.map(n => (
              <li key={n.id} className={`rounded-xl p-3 ${n.type === "warning" ? "bg-amber-50 dark:bg-amber-900/30" : n.type === "success" ? "bg-emerald-50 dark:bg-emerald-900/30" : "bg-sky-50 dark:bg-sky-900/30"}`}>{n.text}</li>
            ))}
          </ul>
          <div className="mt-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Info className="h-4 w-4"/>{T.anomalies}</h4>
            <ul className="space-y-1 text-xs">
              {anomalies.map((a, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
                  <span>{a.t}</span><span className="font-medium">{a.delta}</span><span className="text-slate-500">{a.note}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <button className="rounded-2xl border bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-800" onClick={() => setRoute("compare")}>Benchmark</button>
              <button className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white shadow-sm" onClick={() => setRoute("devices")}>{T.devices}</button>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader title={T.breakdown} subtitle="Share of monthly kWh (mock)" icon={<PlugZap className="h-4 w-4"/>} />
          <div className="h-56 w-full">
            <ChartBoundary>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deviceBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {deviceBreakdown.map((_, i) => (
                      <Cell key={i} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [`${v} kWh`, n]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartBoundary>
          </div>
        </Card>

        <Card>
          <CardHeader title={T.hod} subtitle={`Peak: ${peakHour.hour} (${peakHour.kwh} kWh)`} icon={<BarChart2 className="h-4 w-4"/>} />
          <div className="h-56 w-full">
            <ChartBoundary>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourOfDay} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" interval={3} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="kwh" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartBoundary>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title={T.weekHeat} subtitle="Mon → Sun × 24h (darker = more kWh)" icon={<Activity className="h-4 w-4"/>} />
          <div className="grid grid-cols-24 gap-1">
            {weekHeat.map((day, di) => (
              <div key={di} className="grid grid-cols-24 gap-1">
                {day.map((v, hi) => (
                  <div key={hi} className="h-4 rounded" style={{ backgroundColor: heatColor(v, dark) }} title={`d${di+1} h${hi}: ${v.toFixed(2)} rel`} />
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title={T.costCo2} subtitle="Estimates for this month (mock)" icon={<Leaf className="h-4 w-4"/>} />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <div className="text-slate-500">Cost</div>
              <div className="text-2xl font-semibold">{estCostVND.toLocaleString()} {T.currency}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <div className="text-slate-500">CO₂</div>
              <div className="text-2xl font-semibold">{estCO2kg} kg</div>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Assumes 2,500 VND/kWh and 0.82 kg CO₂/kWh.</p>
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
