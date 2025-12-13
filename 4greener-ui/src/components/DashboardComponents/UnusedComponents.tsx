// Weekly heatmap card component
{/* <Card className="xl:col-span-2">
    <CardHeader title={T.weekHeat} subtitle="Mon → Sun × 24h (darker = more kWh)" icon={<Activity className="h-4 w-4"/>} />
    <div className="grid grid-cols-24 gap-1">
    {weekHeat.map((day, di) => (
        <div key={di} className="grid grid-cols-24 gap-1">
        {day.map((v, hi) => (
            <div key={hi} className="h-4 rounded" style={{ backgroundColor: heatColor(v, dark) }} title={`d${di+1} h${hi}: ${v.toFixed(2)} rel`} />
        ))}
        </div>
    ))}
    </div>
</Card> */}