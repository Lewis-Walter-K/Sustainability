import {
  LogIn, LayoutDashboard, User, Activity, BarChart2, Zap, Gauge, CalendarClock, TrendingUp, Bell,
  Settings as SettingsIcon, CreditCard, PlugZap, Globe, FileDown, Shield, Users, Moon, Sun, Leaf, Info
} from "lucide-react";

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

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-4 ${className ?? ""}`}>{children}</div>;
}

export function Header({ title, subtitle, icon, T }: { title: string; subtitle?: string; icon?: React.ReactNode; T: any }) {
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

export function KPIGrid({ kwhNow, kwhToday, kwhMonth, T }: { kwhNow: number; kwhToday: number; kwhMonth: number; T: any }) {
  // Display units as Wh (values passed into this component are in Wh).
  const cards = [
    { title: T.currentLoad, value: `${kwhNow} Wh`, diff: "+3.1% vs pred", icon: <Activity className="h-5 w-5" /> },
    { title: T.todayUsage, value: `${kwhToday} Wh`, diff: "−6% vs goal", icon: <TrendingUp className="h-5 w-5" /> },
    { title: T.monthUsage, value: `${kwhMonth} Wh`, diff: "+1.4% vs plan", icon: <BarChart2 className="h-5 w-5" /> },
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

export function SegmentedControl({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
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

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className ?? ""}`}>{children}</div>;
}

export function CardHeader({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-semibold">{icon} <span className="truncate">{title}</span></div>
        {subtitle && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-700">
      <span className="text-slate-500 dark:text-slate-300">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
export function exportCSV(rows: any[], filename: string) {
    const headers = Object.keys(rows[0] || {});
    const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csvRows = [
        headers.map(h => escape(h)).join(","),
        ...rows.map(r => headers.map(h => escape(r[h])).join(","))
    ];
    const csv = csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}