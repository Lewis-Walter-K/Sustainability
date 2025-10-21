import React from "react";
import { Header, Card, CardHeader, Container, Row } from "../FuncComponents/GeneralFunc";
import { Settings as SettingsIcon, Globe, Shield } from "lucide-react";

export function SettingSection({ T, dark, setDark, lang, setLang }: { T: any; dark: boolean; setDark: (v: boolean) => void; lang: any; setLang: (l: any) => void }) {
  // Local toggles to avoid depending on other files
  function LangToggleLocal({ lang, setLang }: { lang: any; setLang: (l: any) => void }) {
    return (
      <div className="inline-flex overflow-hidden rounded-xl border dark:border-slate-700">
        <button onClick={() => setLang("en")} className={`px-2 py-1 text-xs ${lang === "en" ? "bg-slate-900 text-white" : "bg-white dark:bg-slate-800"}`}>EN</button>
        <button onClick={() => setLang("vi")} className={`px-2 py-1 text-xs ${lang === "vi" ? "bg-slate-900 text-white" : "bg-white dark:bg-slate-800"}`}>VI</button>
      </div>
    );
  }

  function ThemeToggleLocal({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
    return (
      <button onClick={() => setDark(!dark)} className="inline-flex items-center gap-1 rounded-xl border bg-white px-2 py-1 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {dark ? <span>🌙</span> : <span>☀️</span>}
        <span>{dark ? "Dark" : "Light"}</span>
      </button>
    );
  }

  return (
    <Container className="py-6">
      <Header title={T.settings} subtitle="Preferences & security" icon={<SettingsIcon className="h-5 w-5"/>} T={T} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Preferences" subtitle="Theme & language" icon={<Globe className="h-4 w-4"/>} />
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <span>{T.darkMode}</span>
              <ThemeToggleLocal dark={dark} setDark={setDark} />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <span>{T.language}</span>
              <LangToggleLocal lang={lang} setLang={setLang} />
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
  );
}