import { Moon, Sun } from "lucide-react";

export function LangToggle({ lang, setLang }: { lang: any; setLang: (l: any) => void }) {
  return (
    <div className="inline-flex overflow-hidden rounded-xl border dark:border-slate-700">
      <button onClick={() => setLang("en")} className={`px-2 py-1 text-xs ${lang === "en" ? "bg-slate-900 text-white" : "bg-white dark:bg-slate-800"}`}>EN</button>
      <button onClick={() => setLang("vi")} className={`px-2 py-1 text-xs ${lang === "vi" ? "bg-slate-900 text-white" : "bg-white dark:bg-slate-800"}`}>VI</button>
    </div>
  );
}

export function ThemeToggle({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <button onClick={() => setDark(!dark)} className="inline-flex items-center gap-1 rounded-xl border bg-white px-2 py-1 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {dark ? <Moon className="h-4 w-4"/> : <Sun className="h-4 w-4"/>}
      <span>{dark ? "Dark" : "Light"}</span>
    </button>
  );
}