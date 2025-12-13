export function titleFrom(v: "hour" | "day" | "month") {
  if (v === "hour") return "Next hour prediction (w/ actual overlay)";
  if (v === "day") return "Day predicted vs actual";
  return "Month predicted vs actual";
}

export function subtitleFrom(v: "hour" | "day" | "month") {
  if (v === "hour") return "Granularity: 1h • Model: AR w/ recent load";
  if (v === "day") return "Granularity: 1d • Model: rolling baseline + adjustments";
  return "Granularity: 1mo • Model: seasonal baseline + trend";
}