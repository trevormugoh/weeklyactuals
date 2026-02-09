"use client";

import React, { useEffect, useState, useTransition } from "react";
import { KPI_DATA, WEEKS } from "@/lib/constants";
import { getActuals, saveActual } from "@/app/actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { LayoutDashboard, FileEdit, TrendingUp, Info, Loader2 } from "lucide-react";

export interface WeeklyActual {
    id?: string;
    week: number;
    kpiId: string;
    regionName: string;
    actual: number;
}

export default function WeeklyTracker() {
    const [activeTab, setActiveTab] = useState<"entry" | "dashboard">("entry");
    const [selectedWeek, setSelectedWeek] = useState<number>(1);
    const [allActuals, setAllActuals] = useState<WeeklyActual[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getActuals();
        setAllActuals(data as WeeklyActual[]);
        setIsLoading(false);
    };

    const handleActualChange = async (kpiId: string, regionName: string, value: string) => {
        const actual = parseFloat(value) || 0;

        // Optimistic update
        setAllActuals(prev => {
            const index = prev.findIndex(a => a.week === selectedWeek && a.kpiId === kpiId && a.regionName === regionName);
            if (index > -1) {
                const updated = [...prev];
                updated[index] = { ...updated[index], actual };
                return updated;
            } else {
                return [...prev, { week: selectedWeek, kpiId, regionName, actual }];
            }
        });

        // Save to MongoDB
        startTransition(async () => {
            await saveActual(selectedWeek, kpiId, regionName, actual);
        });
    };

    // Helper to get value for a specific cell
    const getActualValue = (kpiId: string, regionName: string) => {
        return allActuals?.find((a: WeeklyActual) => a.week === selectedWeek && a.kpiId === kpiId && a.regionName === regionName)?.actual?.toString() || "";
    };

    // Helper for cumulative calculations
    const getCumulativeActual = (kpiId: string, regionName: string) => {
        return allActuals
            .filter((a: WeeklyActual) => a.week <= selectedWeek && a.kpiId === kpiId && a.regionName === regionName)
            .reduce((sum: number, a: WeeklyActual) => sum + a.actual, 0);
    };

    return (
        <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Weekly Performance Tracker</h1>
                        <div className="flex items-center gap-2">
                            <p className="text-neutral-500 text-lg">Detailed KPI tracking across programs and regions.</p>
                            {isPending && <Loader2 className="animate-spin text-blue-500 w-4 h-4" />}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-neutral-200">
                        <button
                            onClick={() => setActiveTab("entry")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === "entry" ? "bg-blue-600 text-white shadow-md font-medium" : "text-neutral-600 hover:bg-neutral-100"}`}
                        >
                            <FileEdit size={18} />
                            <span>Data Entry</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("dashboard")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === "dashboard" ? "bg-blue-600 text-white shadow-md font-medium" : "text-neutral-600 hover:bg-neutral-100"}`}
                        >
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <Card className="flex items-center justify-center p-20 border-dashed">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
                            <p className="text-neutral-500 animate-pulse">Connecting to MongoDB Atlas...</p>
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* Global Controls */}
                        <Card className="border-neutral-200 shadow-sm border">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold text-neutral-700">Displaying Data for:</span>
                                    <Select value={selectedWeek.toString()} onValueChange={(v) => setSelectedWeek(parseInt(v))}>
                                        <SelectTrigger className="w-[180px] bg-white border-neutral-200 focus:ring-blue-500">
                                            <SelectValue placeholder="Select Week" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {WEEKS.map(w => (
                                                <SelectItem key={w} value={w.toString()}>Week {w}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {activeTab === "entry" ? (
                            <EntryTable
                                selectedWeek={selectedWeek}
                                handleActualChange={handleActualChange}
                                getActualValue={getActualValue}
                                getCumulativeActual={getCumulativeActual}
                            />
                        ) : (
                            <Dashboard week={selectedWeek} allActuals={allActuals || []} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function EntryTable({ selectedWeek, handleActualChange, getActualValue, getCumulativeActual }: any) {
    return (
        <Card className="overflow-hidden border-neutral-200 shadow-xl">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-neutral-900">
                        <TableRow>
                            <TableHead className="w-[180px] text-white">CATEGORY / KPI</TableHead>
                            <TableHead className="w-[150px] text-white">REGION</TableHead>
                            <TableHead className="text-right text-white bg-neutral-800">ANNUAL GOAL</TableHead>
                            <TableHead className="text-right text-white">TARGET (WK {selectedWeek})</TableHead>
                            <TableHead className="text-right text-white ring-2 ring-blue-500 ring-inset">ACTUAL (WK {selectedWeek})</TableHead>
                            <TableHead className="text-right text-white">% ACHIEVED</TableHead>
                            <TableHead className="text-right text-white">VARIANCE</TableHead>
                            <TableHead className="text-right text-white bg-neutral-800">CUM. BUDGET</TableHead>
                            <TableHead className="text-right text-white bg-neutral-800">CUM. ACTUAL</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {KPI_DATA.map((kpi) => {
                            const kpiTotalTarget = kpi.regions.reduce((sum, r) => sum + r.target, 0);
                            const kpiTotalActual = kpi.regions.reduce((sum, r) => sum + (parseFloat(getActualValue(kpi.id, r.name) as string) || 0), 0);
                            const kpiTotalCumBudget = kpiTotalTarget * selectedWeek; // Assuming constant target per week based on user prompt logic
                            const kpiTotalCumActual = kpi.regions.reduce((sum, r) => sum + getCumulativeActual(kpi.id, r.name), 0);
                            const kpiAchieved = kpiTotalTarget > 0 ? (kpiTotalActual / kpiTotalTarget) * 100 : 0;
                            const kpiVariance = kpiTotalActual - kpiTotalTarget;

                            return (
                                <React.Fragment key={kpi.id}>
                                    {/* Parent KPI Header & Annual Goal */}
                                    <TableRow className="bg-neutral-100/50">
                                        <TableCell className="font-bold text-neutral-900 border-l-4 border-blue-600">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase text-blue-600 font-bold tracking-widest">{kpi.category}</span>
                                                <span className="truncate">{kpi.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-400 italic">Annual Total</TableCell>
                                        <TableCell className="text-right font-black text-blue-900 bg-neutral-100">
                                            {kpi.annualGoal.toLocaleString()}
                                        </TableCell>
                                        <TableCell colSpan={6}></TableCell>
                                    </TableRow>

                                    {/* Regional Rows */}
                                    {kpi.regions.map((region) => {
                                        const actual = parseFloat(getActualValue(kpi.id, region.name) as string) || 0;
                                        const cumActual = getCumulativeActual(kpi.id, region.name);
                                        const cumBudget = region.target * selectedWeek;
                                        const achieved = region.target > 0 ? (actual / region.target) * 100 : 0;
                                        const variance = actual - region.target;

                                        return (
                                            <TableRow key={`${kpi.id}-${region.name}`} className="hover:bg-neutral-50 transition-colors">
                                                <TableCell></TableCell>
                                                <TableCell className="text-neutral-600 pl-4">{region.name}</TableCell>
                                                <TableCell className="bg-neutral-50/30"></TableCell>
                                                <TableCell className="text-right font-medium">{region.target}</TableCell>
                                                <TableCell className="text-right">
                                                    <Input
                                                        type="number"
                                                        className="w-24 ml-auto text-right font-bold border-blue-200 focus-visible:ring-blue-500"
                                                        value={getActualValue(kpi.id, region.name)}
                                                        onChange={(e) => handleActualChange(kpi.id, region.name, e.target.value)}
                                                        placeholder="0"
                                                    />
                                                </TableCell>
                                                <TableCell className={`text-right font-semibold ${achieved >= 100 ? "text-emerald-600" : achieved >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                                                    {achieved.toFixed(0)}%
                                                </TableCell>
                                                <TableCell className={`text-right font-medium ${variance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                                    {variance > 0 ? `+${variance.toFixed(2)}` : variance.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right bg-neutral-50 font-medium text-neutral-500">
                                                    {cumBudget.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right bg-neutral-50 font-bold text-neutral-900">
                                                    {cumActual.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}

                                    {/* KPI Total Row */}
                                    <TableRow className="bg-blue-50 font-bold border-y-2 border-blue-100">
                                        <TableCell className="text-blue-900 italic">Total {kpi.name}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell className="bg-blue-100/50"></TableCell>
                                        <TableCell className="text-right">{kpiTotalTarget}</TableCell>
                                        <TableCell className="text-right border-x-2 border-blue-200">{kpiTotalActual}</TableCell>
                                        <TableCell className={`text-right ${kpiAchieved >= 100 ? "text-emerald-600" : "text-rose-600"}`}>
                                            {kpiAchieved.toFixed(0)}%
                                        </TableCell>
                                        <TableCell className={`text-right ${kpiVariance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                            {kpiVariance > 0 ? `+${kpiVariance}` : kpiVariance}
                                        </TableCell>
                                        <TableCell className="text-right bg-blue-100/30">{kpiTotalCumBudget.toLocaleString()}</TableCell>
                                        <TableCell className="text-right bg-blue-100/30">{kpiTotalCumActual.toLocaleString()}</TableCell>
                                    </TableRow>

                                    {/* Gap row */}
                                    <TableRow className="h-4 border-none hover:bg-transparent"><TableCell colSpan={9}></TableCell></TableRow>
                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}

function Dashboard({ week, allActuals }: { week: number, allActuals: WeeklyActual[] }) {
    // Aggregate data for charts
    const weeklyPerformance = WEEKS.filter(w => w <= week).map(w => {
        const totalTarget = KPI_DATA.reduce((sum, kpi) => sum + kpi.regions.reduce((s, r) => s + r.target, 0), 0);
        const totalActual = allActuals.filter(a => a.week === w).reduce((sum, a) => sum + a.actual, 0);
        return {
            name: `Week ${w}`,
            actual: totalActual,
            target: totalTarget
        };
    });

    const regionalPerformance = KPI_DATA[0].regions.map(r => {
        const totalActual = allActuals.filter(a => a.week === week && a.regionName === r.name).reduce((sum, a) => sum + a.actual, 0);
        const totalTarget = KPI_DATA.reduce((sum, kpi) => sum + (kpi.regions.find(reg => reg.name === r.name)?.target || 0), 0);
        return {
            name: r.name,
            actual: totalActual,
            target: totalTarget
        };
    });

    return (
        <div className="grid gap-8 md:grid-cols-2">
            {/* Stats Overview */}
            <Card className="md:col-span-2 border-neutral-200 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="text-blue-600" />
                        Performance Trend
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyPerformance}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} />
                            <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="border-neutral-200 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LayoutDashboard className="text-purple-600" />
                        Regional Breakdown (Week {week})
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={regionalPerformance} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} fontSize={12} />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="actual" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="border-neutral-200 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="text-emerald-600" />
                        Summary Insights
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                        <p className="text-sm font-medium text-blue-800">Total Progress</p>
                        <p className="text-2xl font-bold text-blue-900">
                            {weeklyPerformance[week - 1]?.actual.toFixed(0) || 0} / {weeklyPerformance[week - 1]?.target.toFixed(0) || 0}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                        <p className="text-sm font-medium text-purple-800">Best Region</p>
                        <p className="text-2xl font-bold text-purple-900">
                            {regionalPerformance.sort((a, b) => b.actual - a.actual)[0]?.name || "N/A"}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
