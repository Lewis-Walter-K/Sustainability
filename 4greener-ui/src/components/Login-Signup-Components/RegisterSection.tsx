import { User } from "lucide-react"; // Icon

export function Register({ T, onSuccess, onBack }: { T: any; onSuccess: ()=>void; onBack: ()=>void }) {
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