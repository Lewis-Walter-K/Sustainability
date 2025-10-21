import {
  LogIn, LayoutDashboard, User, BarChart2, Zap, Settings as SettingsIcon, CreditCard, PlugZap
} from "lucide-react";

export function Nav({ title, route, setRoute, actions }: { title: string; route: string; setRoute: (r: any) => void; actions?: React.ReactNode }) {
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

export function navBtn(active: boolean) {
  return `rounded-2xl px-3 py-2 ${active ? "bg-slate-900 text-white" : "border bg-white dark:border-slate-700 dark:bg-slate-800"}`;
}