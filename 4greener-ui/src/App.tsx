import React, { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { LangToggle, ThemeToggle } from "./components/AdditionComponents/ToggleFunc.tsx";
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import {Footer} from "./components/Footer";
import { DashboardMain } from "./components/DashboardComponents/DashboardMain.tsx";
import { ProfileMain } from "./components/ProfileComponents/ProfileSection.tsx";
import { DeviceSection } from "./components/DevicesComponent/DeviceSection.tsx";
import { BillingSection } from "./components/AdditionComponents/BillingSection.tsx";
import { CompareSection } from "./components/AdditionComponents/CompareSection.tsx";
import { SettingSection } from "./components/AdditionComponents/SettingSection.tsx";
import { Nav, navBtn } from "./components/Nav.tsx";
import { Forgot } from "./components/Login-Signup-Components/ForgotSection.tsx";
import Login  from "./components/Login-Signup-Components/Login.tsx";
import SignUp from "./components/Login-Signup-Components/SignUp.tsx";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAxNuTY_TPghba48v1A2oHruPFNr_qRefI",
  authDomain: "sustainability-6acf4.firebaseapp.com",
  projectId: "sustainability-6acf4",
  storageBucket: "sustainability-6acf4.firebasestorage.app",
  messagingSenderId: "1042030904992",
  appId: "1:1042030904992:web:f4478f94683f9da105abc5",
  measurementId: "G-K1JR5SPERM"
};
initializeApp(firebaseConfig);

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
  const storedRoute = (typeof window !== 'undefined' && localStorage.getItem('app_route')) || 'login';
  const [route, setRoute] = useState<
    "login" | "register" | "forgot" | "dashboard" | "profile" | "devices" | "billing" | "compare" | "settings"
  >((storedRoute as any) || 'login');
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<keyof typeof STR>("en");
  const T = STR[lang];
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // subscribe to Firebase auth state and keep user/email in state
  useEffect(() => {
    try {
      const auth = getAuth();
      let first = true;
      const unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (first) {
          // initial auth event: if user is already signed in and stored route is a login/register page,
          // switch to dashboard once. Otherwise keep stored route so refresh preserves last page.
          first = false;
          try {
            const sr = storedRoute;
            if (u && (sr === 'login' || sr === 'register' || sr === 'forgot')) {
              setRoute('dashboard');
            }
          } catch (e) {}
        }
      });
      return () => unsub();
    } catch (e) {
      // firebase not initialized or not available during static analysis
      console.warn('auth subscription failed', e);
    }
  }, []);

  // persist route across refreshes so user returns to last visited page
  useEffect(() => {
    try {
      localStorage.setItem('app_route', route);
    } catch (e) {}
  }, [route]);

  async function handleSignOut() {
    try {
      const auth = getAuth();
      await firebaseSignOut(auth);
      setUser(null);
      setRoute('login');
    } catch (e) {
      console.error('Sign out failed', e);
    }
  }

  // simple toast/snackbar system
  const [toasts, setToasts] = useState<{ id: number; message: string; kind?: 'success'|'error'|'info' }[]>([]);
  const nextToastId = React.useRef(1);
  function notify(message: string, kind: 'success'|'error'|'info' = 'info', ttl = 3500) {
    const id = nextToastId.current++;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), ttl);
  }

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
        isAuthenticated={!!user}
        actions={
          <div className="flex items-center gap-3">
            <button className={navBtn(false)} onClick={() => alert("Notifications panel opened (stub)")}> <Bell className="mr-1 h-4 w-4"/> {T.notificationCenter}</button>
            <LangToggle lang={lang} setLang={setLang} />
            <ThemeToggle dark={dark} setDark={setDark} />
          </div>
        }
      />

  {route === "login" && <Login notify={notify} setRoute={setRoute} />}
  {route === "register" && <SignUp notify={notify} setRoute={setRoute} />}
      {route === "forgot" && <Forgot T={T} onBack={() => setRoute("login")} />}

      {route === "dashboard" && (
        <DashboardMain T={T} setRoute={setRoute} dark={dark} />
      )}

      {route === "profile" && <ProfileMain T={T} setRoute={setRoute} dark={dark} userEmail={user?.email} onSignOut={handleSignOut} />}

      {route === "devices" && <DeviceSection T={T} setRoute={setRoute} dark={dark} />}

      {route === "billing" && <BillingSection T={T} />}

      {route === "compare" && <CompareSection T={T} />}

      {route === "settings" && <SettingSection T={T} dark={dark} setDark={setDark} lang={lang} setLang={setLang} />}

      <Footer />
      {/* Toasts */}
      <div aria-live="polite" className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6">
        <div className="w-full flex flex-col items-end space-y-4">
          {toasts.map(t => (
            <div key={t.id} className={`pointer-events-auto max-w-sm w-full rounded-xl p-3 shadow-lg ${t.kind === 'error' ? 'bg-red-600 text-white' : t.kind === 'success' ? 'bg-green-600 text-white' : 'bg-slate-800 text-white'}`}>
              {t.message}
            </div>
          ))}
        </div>
      </div>
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