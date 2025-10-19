import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
  Area, AreaChart, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import {
  LogIn, LayoutDashboard, User, Activity, BarChart2, Zap, Gauge, CalendarClock, TrendingUp, Bell,
  Settings as SettingsIcon, CreditCard, PlugZap, Globe, FileDown, Shield, Users, Moon, Sun, Leaf, Info
} from "lucide-react";

// 4Greener – Single-file React demo app with expanded features and richer visuals
// TailwindCSS utilities only. Replace mock data and handlers with real APIs later.

// ──────────────────────────────────────────────────────────────────────────────
// i18n (very light)
const STR = {
  en: {
    app: "4Greener – Smart Energy Tracker",
    login: "Login",
    dashboard: "Dashboard",
    profile: "Profile",
    devices: "Devices",
    billing: "Billing",
    compare: "Compare",
    settings: "Settings",
    alerts: "Alerts & Tips",
    signIn: "Sign in",
    register: "Create account",
    forgot: "Forgot password?",
    remember: "Remember me",
    continue: "Continue",
    export: "Export",
    share: "Share",
    currentLoad: "Current load",
    todayUsage: "Today usage",
    monthUsage: "This month",
    nextHour: "Next hour",
    dayPred: "Day predicted",
    monthPred: "Month predicted",
    actual: "Actual",
    predicted: "Predicted",
    account: "Account",
    goals: "Goals",
    scheduling: "Scheduling",
    budget: "Monthly budget",
    target: "Energy target",
    co2: "CO₂ target",
    tariff: "Tariff",
    plan: "Plan",
    price: "Price",
    currency: "VND",
    deviceList: "Registered Devices",
    addDevice: "Add device",
    billingHistory: "Billing History",
    payNow: "Pay now",
    darkMode: "Dark mode",
    language: "Language",
    security: "Security",
    sessions: "Active Sessions",
    logoutAll: "Log out all",
    notificationCenter: "Notification Center",
    compareTitle: "Your usage vs Similar users",
    breakdown: "Usage by device",
    hod: "Hour-of-day distribution",
    weekHeat: "Weekly heatmap",
    costCo2: "Cost & CO₂ summary",
    anomalies: "Anomalies (last 24h)",
    modelMetrics: "Model metrics",
  },
  vi: {
    app: "4Greener – Theo dõi năng lượng",
    login: "Đăng nhập",
    dashboard: "Bảng điều khiển",
    profile: "Hồ sơ",
    devices: "Thiết bị",
    billing: "Thanh toán",
    compare: "So sánh",
    settings: "Cài đặt",
    alerts: "Cảnh báo & Gợi ý",
    signIn: "Đăng nhập",
    register: "Tạo tài khoản",
    forgot: "Quên mật khẩu?",
    remember: "Ghi nhớ",
    continue: "Tiếp tục",
    export: "Xuất dữ liệu",
    share: "Chia sẻ",
    currentLoad: "Tải hiện tại",
    todayUsage: "Hôm nay",
    monthUsage: "Tháng này",
    nextHour: "Giờ kế tiếp",
    dayPred: "Dự báo ngày",
    monthPred: "Dự báo tháng",
    actual: "Thực tế",
    predicted: "Dự báo",
    account: "Tài khoản",
    goals: "Mục tiêu",
    scheduling: "Lập lịch",
    budget: "Ngân sách tháng",
    target: "Mục tiêu điện",
    co2: "Mục tiêu CO₂",
    tariff: "Biểu giá",
    plan: "Gói",
    price: "Giá",
    currency: "VND",
    deviceList: "Thiết bị đã đăng ký",
    addDevice: "Thêm thiết bị",
    billingHistory: "Lịch sử hóa đơn",
    payNow: "Thanh toán",
    darkMode: "Chế độ tối",
    language: "Ngôn ngữ",
    security: "Bảo mật",
    sessions: "Phiên đang hoạt động",
    logoutAll: "Đăng xuất tất cả",
    notificationCenter: "Trung tâm thông báo",
    compareTitle: "Bạn vs Người dùng tương tự",
    breakdown: "Theo thiết bị",
    hod: "Phân bố theo giờ",
    weekHeat: "Bản đồ nhiệt tuần",
    costCo2: "Chi phí & CO₂",
    anomalies: "Bất thường (24h)",
    modelMetrics: "Chỉ số mô hình",
  }
} as const;

export default function FourGreenerApp() {
  const [route, setRoute] = useState<
    "login" | "register" | "forgot" | "dashboard" | "profile" | "devices" | "billing" | "compare" | "settings"
  >("login");
  const [predictionView, setPredictionView] = useState<"hour" | "day" | "month">("hour");
  const [showActual, setShowActual] = useState(true);
  const [showPred, setShowPred] = useState(true);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<keyof typeof STR>("en");
  const T = STR[lang];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // ─── Mock data ─────────────────────────────────────────────────────────────
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

  const kwhNow = hourlyData[hourlyData.length - 1]?.actual ?? 0.32;
  const kwhToday = dailyData[dailyData.length - 1]?.actual ?? 9.8;
  const kwhMonth = monthlyData[monthlyData.length - 1]?.actual ?? 205;

  // Additional mock datasets for richer visuals
  const deviceBreakdown = [
    { name: "A/C", value: 72 },
    { name: "Fridge", value: 38 },
    { name: "Lighting", value: 22 },
    { name: "Laptop", value: 18 },
    { name: "Other", value: 15 },
  ];

  const hourOfDay = Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, "0")}:00`, kwh: +(0.22 + 0.18 * Math.sin((h / 24) * Math.PI * 2 + 0.6) + Math.max(0, (h - 19)) * 0.01).toFixed(2) }));

  // Weekly heatmap (7 days x 24 hours) values 0..1
  const weekHeat = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => 0.2 + 0.7 * Math.max(0, Math.sin((h / 24) * Math.PI * 2 + d * 0.4)))
  );

  // Derived info
  const estCostVND = Math.round(kwhMonth * 2500); // mock tariff average
  const estCO2kg = +(kwhMonth * 0.82).toFixed(1); // mock factor 0.82 kg/kWh
  const peakHour = hourOfDay.reduce((a, b) => (b.kwh > a.kwh ? b : a));

  // Notifications (mock)
  const notifications = [
    { id: 1, type: "warning", text: "Spike at 21:00 (+34%). Delay laundry 1h." },
    { id: 2, type: "success", text: "On track: −6% vs daily goal." },
    { id: 3, type: "info", text: "Tip: Enable A/C Eco at night." },
  ];

  const anomalies = [
    { t: "21:00", delta: "+34%", note: "Laundry + A/C overlap" },
    { t: "06:30", delta: "+18%", note: "Morning kettle peak" },
  ];

  // Devices (mock)
  const devices = [
    { id: "mtr-001", name: "Smart Meter A", room: "2B-316", status: "online", baseW: 120 },
    { id: "plg-204", name: "Smart Plug – AC", room: "2B-316", status: "online", baseW: 60 },
    { id: "plg-118", name: "Smart Plug – Fridge", room: "2B-316", status: "offline", baseW: 40 },
  ];

  // Billing (mock)
  const bills = [
    { id: "INV-2025-08", period: "Aug 2025", kwh: 198, amount: 495000, status: "paid" },
    { id: "INV-2025-09", period: "Sep 2025", kwh: 205, amount: 512500, status: "paid" },
    { id: "INV-2025-10", period: "Oct 2025", kwh: 201, amount: 502500, status: "due" },
  ];

  // Compare (mock similar users)
  const peers = [
    { label: "You", value: Math.round(kwhMonth) },
    { label: "Dorm avg", value: 215 },
    { label: "Efficient 20%", value: 175 },
  ];

  // ─── Layout ────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${dark ? "dark bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      <Nav
        title={T.app}
        route={route}
        setRoute={setRoute}
        actions={
          <div className="flex items-center gap-2">
            <button className={navBtn(false)} onClick={() => setRoute("settings")}><SettingsIcon className="mr-1 h-4 w-4"/>{T.settings}</button>
            <button className={navBtn(false)} onClick={() => alert("Notifications panel opened (stub)")}> <Bell className="mr-1 h-4 w-4"/> {T.notificationCenter}</button>
            <LangToggle lang={lang} setLang={setLang} />
            <ThemeToggle dark={dark} setDark={setDark} />
          </div>
        }
      />

      {route === "login" && <Login T={T} onSuccess={() => setRoute("dashboard")} onRegister={() => setRoute("register")} onForgot={() => setRoute("forgot")} />}
      {route === "register" && <Register T={T} onSuccess={() => setRoute("dashboard")} onBack={() => setRoute("login")} />}
      {route === "forgot" && <Forgot T={T} onBack={() => setRoute("login")} />}

      {route === "dashboard" && (
        <Container className="py-6">
          <Header title={T.dashboard} subtitle="Real-time overview & key insights" icon={<LayoutDashboard className="h-5 w-5"/>} T={T} />
          <KPIGrid T={T} kwhNow={kwhNow} kwhToday={kwhToday} kwhMonth={kwhMonth} />

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
            {/* Main timeseries */}
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

            {/* Alerts + anomalies */}
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

          {/* Rich visual row */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {/* Donut breakdown */}
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

            {/* Hour of day distribution */}
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

            {/* Weekly heatmap (CSS grid) */}
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

          {/* Cost & CO2 */}
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
                <button className="rounded-2xl border bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-800" onClick={() => exportCSV(hourlyData, "hourly.csv")}>
                  {T.export} (CSV)
                </button>
                <button className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white shadow-sm">{T.share}</button>
              </div>
            </Card>
          </div>
        </Container>
      )}

      {route === "profile" && (
        <Container className="py-6">
          <Header title={T.profile} subtitle="Usage trend & predictions" icon={<User className="h-5 w-5"/>} T={T} />

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <SegmentedControl
              value={predictionView}
              onChange={(v) => setPredictionView(v as any)}
              options={[
                { value: "hour", label: T.nextHour },
                { value: "day", label: T.dayPred },
                { value: "month", label: T.monthPred },
              ]}
            />
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
                  {predictionView === "hour" && (
                    <LineChart data={hourlyData} margin={{ left: 8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="t" />
                      <YAxis label={{ value: "kWh", angle: -90, position: "insideLeft", offset: 10 }} />
                      <Tooltip formatter={(v: any) => `${v} kWh`} />
                      <Legend />
                      <Line type="monotone" dataKey="actual" name={T.actual} strokeWidth={2} dot={false} hide={!showActual} />
                      <Line type="monotone" dataKey="pred" name={T.predicted} strokeWidth={2} strokeDasharray="4 2" dot={false} hide={!showPred} />
                    </LineChart>
                  )}
                  {predictionView === "day" && (
                    <BarChart data={dailyData} margin={{ left: 8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="d" />
                      <YAxis label={{ value: "kWh/day", angle: -90, position: "insideLeft", offset: 10 }} />
                      <Tooltip formatter={(v: any) => `${v} kWh`} />
                      <Legend />
                      <Bar dataKey="actual" name={T.actual} radius={[8,8,0,0]} hide={!showActual} />
                      <Bar dataKey="pred" name={T.predicted} radius={[8,8,0,0]} hide={!showPred} />
                    </BarChart>
                  )}
                  {predictionView === "month" && (
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

          {/* Account details & metrics */}
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

          {/* Tariff + Export */}
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
      )}

      {route === "devices" && (
        <Container className="py-6">
          <Header title={T.devices} subtitle="Manage meters & smart plugs" icon={<PlugZap className="h-5 w-5"/>} T={T} />
          <Card>
            <CardHeader title={T.deviceList} subtitle="Room 2B-316" icon={<Users className="h-4 w-4"/>} />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Room</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Base W</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map(d => (
                    <tr key={d.id} className="border-t">
                      <td className="px-3 py-2 font-mono">{d.id}</td>
                      <td className="px-3 py-2">{d.name}</td>
                      <td className="px-3 py-2">{d.room}</td>
                      <td className="px-3 py-2 capitalize">{d.status}</td>
                      <td className="px-3 py-2">{d.baseW} W</td>
                      <td className="px-3 py-2">
                        <button className="rounded-xl border px-2 py-1 text-xs">Edit</button>
                        <button className="ml-2 rounded-xl border px-2 py-1 text-xs">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <button className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white shadow-sm">{T.addDevice}</button>
            </div>
          </Card>
        </Container>
      )}

      {route === "billing" && (
        <Container className="py-6">
          <Header title={T.billing} subtitle="Invoices & payment" icon={<CreditCard className="h-5 w-5"/>} T={T} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader title={T.billingHistory} subtitle="Past 3 months" icon={<CreditCard className="h-4 w-4"/>} />
              <ul className="space-y-2 text-sm">
                {bills.map(b => (
                  <li key={b.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                    <div>
                      <div className="font-medium">{b.period} • {b.kwh} kWh</div>
                      <div className="text-xs text-slate-500">{b.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{b.amount.toLocaleString()} {T.currency}</div>
                      <div className={`text-xs capitalize ${b.status === "due" ? "text-amber-600" : "text-emerald-600"}`}>{b.status}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <CardHeader title="Quick pay" subtitle="Visa/Mastercard (stub)" icon={<CreditCard className="h-4 w-4"/>} />
              <div className="space-y-3 text-sm">
                <input className="w-full rounded-xl border bg-white px-3 py-2 dark:bg-slate-800" placeholder="Card number" />
                <div className="grid grid-cols-2 gap-2">
                  <input className="rounded-xl border bg-white px-3 py-2 dark:bg-slate-800" placeholder="MM/YY" />
                  <input className="rounded-xl border bg-white px-3 py-2 dark:bg-slate-800" placeholder="CVC" />
                </div>
                <button className="w-full rounded-2xl bg-slate-900 px-3 py-2 text-white">{T.payNow}</button>
              </div>
            </Card>
          </div>
        </Container>
      )}

      {route === "compare" && (
        <Container className="py-6">
          <Header title={T.compare} subtitle={T.compareTitle} icon={<BarChart2 className="h-5 w-5"/>} T={T} />
          <Card>
            <div className="h-72 w-full">
              <ChartBoundary>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peers} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis label={{ value: "kWh/month", angle: -90, position: "insideLeft", offset: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8,8,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartBoundary>
            </div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">Hint: set a goal near Efficient 20% for savings.</div>
          </Card>
        </Container>
      )}

      {route === "settings" && (
        <Container className="py-6">
          <Header title={T.settings} subtitle="Preferences & security" icon={<SettingsIcon className="h-5 w-5"/>} T={T} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader title="Preferences" subtitle="Theme & language" icon={<Globe className="h-4 w-4"/>} />
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <span>{T.darkMode}</span>
                  <ThemeToggle dark={dark} setDark={setDark} />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <span>{T.language}</span>
                  <LangToggle lang={lang} setLang={setLang} />
                </div>
              </div>
            </Card>
            <Card>
              <CardHeader title={T.security} subtitle="Sessions & 2FA (stub)" icon={<Shield className="h-4 w-4"/>} />
              <div className="space-y-2 text-sm">
                <Row label={T.sessions} value="Chrome • Windows • Now" />
                <Row label="2FA" value="Authenticator app (on)" />
                <button className="rounded-2xl border bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-800">{T.logoutAll}</button>
              </div>
            </Card>
          </div>
        </Container>
      )}

      <Footer />
    </div>
  );
}

// ─── Error Boundary to isolate 3rd-party chart crashes ─────────────────────
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

// ─── Small components ───────────────────────────────────────────────────────
function Nav({ title, route, setRoute, actions }: { title: string; route: string; setRoute: (r: any) => void; actions?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-30 w-full border-b bg-white/70 backdrop-blur dark:bg-slate-900/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6" />
          <span className="font-semibold">{title}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button onClick={() => setRoute("login")} className={navBtn(route === "login")}><LogIn className="mr-1 h-4 w-4"/> Login</button>
          <button onClick={() => setRoute("dashboard")} className={navBtn(route === "dashboard")}><LayoutDashboard className="mr-1 h-4 w-4"/> Dashboard</button>
          <button onClick={() => setRoute("profile")} className={navBtn(route === "profile")}><User className="mr-1 h-4 w-4"/> Profile</button>
          <button onClick={() => setRoute("devices")} className={navBtn(route === "devices")}><PlugZap className="mr-1 h-4 w-4"/> Devices</button>
          <button onClick={() => setRoute("billing")} className={navBtn(route === "billing")}><CreditCard className="mr-1 h-4 w-4"/> Billing</button>
          <button onClick={() => setRoute("compare")} className={navBtn(route === "compare")}><BarChart2 className="mr-1 h-4 w-4"/> Compare</button>
          <button onClick={() => setRoute("settings")} className={navBtn(route === "settings")}><SettingsIcon className="mr-1 h-4 w-4"/> Settings</button>
          {actions}
        </div>
      </div>
    </div>
  );
}

function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-4 ${className ?? ""}`}>{children}</div>;
}

function Header({ title, subtitle, icon, T }: { title: string; subtitle?: string; icon?: React.ReactNode; T: any }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 text-lg font-semibold">{icon} <span>{title}</span></div>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <button className="rounded-2xl border bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-800"><FileDown className="mr-1 h-4 w-4"/>{T.export}</button>
        <button className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white shadow-sm">{T.share}</button>
      </div>
    </div>
  );
}

function KPIGrid({ kwhNow, kwhToday, kwhMonth, T }: { kwhNow: number; kwhToday: number; kwhMonth: number; T: any }) {
  const cards = [
    { title: T.currentLoad, value: `${kwhNow} kWh`, diff: "+3.1% vs pred", icon: <Activity className="h-5 w-5" /> },
    { title: T.todayUsage, value: `${kwhToday} kWh`, diff: "−6% vs goal", icon: <TrendingUp className="h-5 w-5" /> },
    { title: T.monthUsage, value: `${kwhMonth} kWh`, diff: "+1.4% vs plan", icon: <BarChart2 className="h-5 w-5" /> },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((c, i) => (
        <Card key={i}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{c.title}</p>
              <p className="text-2xl font-semibold">{c.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{c.diff}</p>
            </div>
            <div className="rounded-2xl border bg-white p-3 shadow-sm dark:bg-slate-800">{c.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SegmentedControl({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="inline-flex rounded-2xl border bg-white p-1 shadow-sm dark:bg-slate-800">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-xl px-3 py-2 text-sm transition ${value === o.value ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className ?? ""}`}>{children}</div>;
}

function CardHeader({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-semibold">{icon} <span className="truncate">{title}</span></div>
        {subtitle && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-700">
      <span className="text-slate-500 dark:text-slate-300">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function titleFrom(v: "hour" | "day" | "month") {
  if (v === "hour") return "Next hour prediction (w/ actual overlay)";
  if (v === "day") return "Day predicted vs actual";
  return "Month predicted vs actual";
}

function subtitleFrom(v: "hour" | "day" | "month") {
  if (v === "hour") return "Granularity: 1h • Model: AR w/ recent load";
  if (v === "day") return "Granularity: 1d • Model: rolling baseline + adjustments";
  return "Granularity: 1mo • Model: seasonal baseline + trend";
}

function Login({ T, onSuccess, onRegister, onForgot }: { T: any; onSuccess: () => void; onRegister: () => void; onForgot: () => void }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-2 text-lg font-semibold"><LogIn className="h-5 w-5" /> <span>{T.signIn}</span></div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Email</label>
            <input type="email" placeholder="you@university.edu" className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-700" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Password</label>
            <input type="password" placeholder="••••••••" className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-700" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2"><input type="checkbox"/> {T.remember}</label>
            <button onClick={onForgot} className="text-slate-600 underline-offset-4 hover:underline dark:text-slate-300">{T.forgot}</button>
          </div>
          <button onClick={onSuccess} className="mt-2 w-full rounded-2xl bg-slate-900 px-3 py-2 text-white">{T.continue}</button>
          <button onClick={onRegister} className="mt-2 w-full rounded-2xl border bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">{T.register}</button>
        </div>
      </div>
    </div>
  );
}

function Register({ T, onSuccess, onBack }: { T: any; onSuccess: ()=>void; onBack: ()=>void }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-2 text-lg font-semibold"><User className="h-5 w-5" /> <span>{T.register}</span></div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Full name" className="rounded-xl border px-3 py-2 dark:border-slate-700 dark:bg-slate-700" />
            <input placeholder="Room" className="rounded-xl border px-3 py-2 dark:border-slate-700 dark:bg-slate-700" />
          </div>
          <input type="email" placeholder="you@university.edu" className="w-full rounded-xl border px-3 py-2 dark:border-slate-700 dark:bg-slate-700" />
          <input type="password" placeholder="Create password" className="w-full rounded-xl border px-3 py-2 dark:border-slate-700 dark:bg-slate-700" />
          <div className="flex items-center gap-2 text-sm"><input type="checkbox"/> <span>Agree to terms</span></div>
          <div className="flex gap-2">
            <button onClick={onBack} className="w-1/2 rounded-2xl border bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">Back</button>
            <button onClick={onSuccess} className="w-1/2 rounded-2xl bg-slate-900 px-3 py-2 text-white">{T.continue}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Forgot({ T, onBack }: { T: any; onBack: ()=>void }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-2 text-lg font-semibold"><CalendarClock className="h-5 w-5" /> <span>{T.forgot}</span></div>
        <div className="space-y-3">
          <input type="email" placeholder="you@university.edu" className="w-full rounded-xl border px-3 py-2 dark:border-slate-700 dark:bg-slate-700" />
          <button className="w-full rounded-2xl bg-slate-900 px-3 py-2 text-white">Send reset link</button>
          <button onClick={onBack} className="w-full rounded-2xl border bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">Back</button>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="mt-8 border-t py-6 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
      Built for 4Greener demo • Recharts • lucide-react • TailwindCSS <span className="mx-1">•</span> Toggle theme & language in Settings
    </div>
  );
}

function LangToggle({ lang, setLang }: { lang: keyof typeof STR; setLang: (l: keyof typeof STR) => void }) {
  return (
    <div className="inline-flex overflow-hidden rounded-xl border dark:border-slate-700">
      <button onClick={() => setLang("en")} className={`px-2 py-1 text-xs ${lang === "en" ? "bg-slate-900 text-white" : "bg-white dark:bg-slate-800"}`}>EN</button>
      <button onClick={() => setLang("vi")} className={`px-2 py-1 text-xs ${lang === "vi" ? "bg-slate-900 text-white" : "bg-white dark:bg-slate-800"}`}>VI</button>
    </div>
  );
}

function ThemeToggle({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <button onClick={() => setDark(!dark)} className="inline-flex items-center gap-1 rounded-xl border bg-white px-2 py-1 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {dark ? <Moon className="h-4 w-4"/> : <Sun className="h-4 w-4"/>}
      <span>{dark ? "Dark" : "Light"}</span>
    </button>
  );
}

function navBtn(active: boolean) {
  return `rounded-2xl px-3 py-2 ${active ? "bg-slate-900 text-white" : "border bg-white dark:border-slate-700 dark:bg-slate-800"}`;
}

function exportCSV(rows: any[], filename: string) {
  const headers = Object.keys(rows[0] || {});
  const csv = [headers.join(",")].concat(rows.map(r => headers.map(h => r[h]).join(","))).join("\\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function heatColor(v: number, dark: boolean) {
  // Simple blue palette (light → dark)
  const t = Math.max(0, Math.min(1, v));
  const base = dark ? 230 : 210; // hue
  const lightness = dark ? 35 - t * 20 : 85 - t * 35;
  return `hsl(${base}, 90%, ${lightness}%)`;
}
