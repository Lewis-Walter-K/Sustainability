import React from "react";
import { Header, Container, Card, CardHeader } from "../FuncComponents/GeneralFunc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart2 } from "lucide-react";

class LocalChartBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message?: string }> {
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

export function CompareSection({ T }: { T: any }) {
  const peers = [
    { label: "You", value: 205 },
    { label: "Dorm avg", value: 215 },
    { label: "Efficient 20%", value: 175 },
  ];

  return (
    <Container className="py-6">
      <Header title={T.compare} subtitle={T.compareTitle} icon={<BarChart2 className="h-5 w-5"/>} T={T} />
      <Card>
        <div className="h-72 w-full">
          <LocalChartBoundary>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peers} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis label={{ value: "kWh/month", angle: -90, position: "insideLeft", offset: 10 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </LocalChartBoundary>
        </div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">Hint: set a goal near Efficient 20% for savings.</div>
      </Card>
    </Container>
  );
}