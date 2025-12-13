import { CalendarClock } from "lucide-react"; // Icon

export function Forgot({ T, onBack }: { T: any; onBack: ()=>void }) {
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