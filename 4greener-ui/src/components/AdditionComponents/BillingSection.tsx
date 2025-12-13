import React from "react";
import { CreditCard } from "lucide-react";
import { Header, Card, CardHeader, Container } from "../FuncComponents/GeneralFunc";

export function BillingSection({ T }: { T: any }) {
  // local mock bills (same shape as used elsewhere)
  const bills = [
    { id: "INV-2025-08", period: "Aug 2025", kwh: 198, amount: 495000, status: "paid" },
    { id: "INV-2025-09", period: "Sep 2025", kwh: 205, amount: 512500, status: "paid" },
    { id: "INV-2025-10", period: "Oct 2025", kwh: 201, amount: 502500, status: "due" },
  ];

  return (
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
  );
}