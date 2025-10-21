import { LogIn } from "lucide-react"; // Icon

export function Login({ T, onSuccess, onRegister, onForgot }: { T: any; onSuccess: () => void; onRegister: () => void; onForgot: () => void }) {
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