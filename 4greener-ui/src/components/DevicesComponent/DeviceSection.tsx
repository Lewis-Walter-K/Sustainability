import React from "react";
import { Container, Header, Card, CardHeader } from "../FuncComponents/GeneralFunc";
import { PlugZap, Users } from "lucide-react";

export function DeviceSection({ T, setRoute, dark }: { T: any; setRoute?: (r: any) => void; dark?: boolean }) {
    const devices = [
        { id: "mtr-001", name: "Smart Meter A", room: "2B-316", status: "online", baseW: 120 },
        { id: "plg-204", name: "Smart Plug – AC", room: "2B-316", status: "online", baseW: 60 },
        { id: "plg-118", name: "Smart Plug – Fridge", room: "2B-316", status: "offline", baseW: 40 },
    ];

    return (
        <Container className="py-6">
            <Header title={T.devices} subtitle="Manage meters & smart plugs" icon={<PlugZap className="h-5 w-5"/>} T={T} />
            <Card>
                <CardHeader title={T.deviceList} subtitle="Room 2B-316" icon={<Users className="h-4 w-4"/>} />
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-slate-500">
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">Room</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Base W</th>
                                <th className="px-3 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map((d) => (
                                <tr key={d.id} className="border-t">
                                    <td className="px-3 py-2 font-mono">{d.id}</td>
                                    <td className="px-3 py-2">{d.name}</td>
                                    <td className="px-3 py-2">{d.room}</td>
                                    <td className="px-3 py-2 capitalize">{d.status}</td>
                                    <td className="px-3 py-2">{d.baseW} W</td>
                                    <td className="px-3 py-2">
                                                <button className="rounded-xl border px-2 py-1 text-xs" onClick={() => setRoute?.('devices')}>Edit</button>
                                                <button className="ml-2 rounded-xl border px-2 py-1 text-xs">Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3">
                    <button className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white shadow-sm">{T.addDevice}</button>
                </div>
            </Card>
        </Container>
    );
}