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
import { LayoutDashboard, FileEdit, TrendingUp, Info, Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

export interface WeeklyActual {
    id?: string;
    week: number;
    kpiId: string;
    regionName: string;
    actual: number;
}

export default function WeeklyTracker() {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState<"entry" | "dashboard">("entry");
    const [selectedWeek, setSelectedWeek] = useState<number>(1);
    const [allActuals, setAllActuals] = useState<WeeklyActual[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [localActuals, setLocalActuals] = useState<Record<string, string>>({});
    const [selectedKpiId, setSelectedKpiId] = useState<string>(KPI_DATA[0].id);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getActuals();
        setAllActuals(data as WeeklyActual[]);
        setIsLoading(false);
    };

    const handleActualChange = (kpiId: string, regionName: string, value: string) => {
        const key = `${selectedWeek}-${kpiId}-${regionName}`;
        setLocalActuals(prev => ({ ...prev, [key]: value }));
    };

    const handleBlur = async (kpiId: string, regionName: string, value: string) => {
        const actual = parseFloat(value) || 0;

        setIsSaving(true);
        try {
            const result = await saveActual(selectedWeek, kpiId, regionName, actual);
            if (result.success) {
                // Update the main data state after successful save
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
            } else {
                console.error("Failed to save:", result.error);
                // Optionally revert local state or show an error toast here
            }
        } catch (error) {
            console.error("Error saving actual:", error);
        } finally {
            setIsSaving(false);
        }
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
                            {(isPending || isSaving) && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full">
                                    <Loader2 className="animate-spin text-primary w-3 h-3" />
                                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Saving</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-neutral-200">
                            <button
                                onClick={() => setActiveTab("entry")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === "entry" ? "bg-primary text-white shadow-md font-medium" : "text-neutral-600 hover:bg-neutral-100"}`}
                            >
                                <FileEdit size={18} />
                                <span>Data Entry</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("dashboard")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === "dashboard" ? "bg-primary text-white shadow-md font-medium" : "text-neutral-600 hover:bg-neutral-100"}`}
                            >
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </button>
                        </div>
                        <Button
                            variant="outline"
                            className="bg-white border-neutral-200 text-neutral-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all rounded-xl"
                            onClick={logout}
                        >
                            <LogOut size={18} className="mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <Card className="flex items-center justify-center p-20 border-dashed">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-primary w-8 h-8" />
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
                                    <Select value={selectedWeek.toString()} onValueChange={(v: string) => setSelectedWeek(parseInt(v))}>
                                        <SelectTrigger className="w-[180px] bg-white border-neutral-200 focus:ring-primary">
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
                                handleBlur={handleBlur}
                                getActualValue={getActualValue}
                                getCumulativeActual={getCumulativeActual}
                                localActuals={localActuals}
                            />
                        ) : (
                            <Dashboard
                                week={selectedWeek}
                                allActuals={allActuals || []}
                                selectedKpiId={selectedKpiId}
                                setSelectedKpiId={setSelectedKpiId}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

interface EntryTableProps {
    selectedWeek: number;
    handleActualChange: (kpiId: string, regionName: string, value: string) => void;
    handleBlur: (kpiId: string, regionName: string, value: string) => Promise<void>;
    getActualValue: (kpiId: string, regionName: string) => string;
    getCumulativeActual: (kpiId: string, regionName: string) => number;
    localActuals: Record<string, string>;
}

function EntryTable({ selectedWeek, handleActualChange, handleBlur, getActualValue, getCumulativeActual, localActuals }: EntryTableProps) {
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
                            <TableHead className="text-right text-white ring-2 ring-primary ring-inset">ACTUAL (WK {selectedWeek})</TableHead>
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
                                        <TableCell className="font-bold text-neutral-900 border-l-4 border-primary">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase text-primary font-bold tracking-widest">{kpi.category}</span>
                                                <span className="truncate">{kpi.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-400 italic">Annual Total</TableCell>
                                        <TableCell className="text-right font-black text-primary bg-neutral-100">
                                            {kpi.unit === "currency" ? `$${kpi.annualGoal.toLocaleString()}` : kpi.annualGoal.toLocaleString()}
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
                                                <TableCell className="text-right font-medium">
                                                    {kpi.unit === "currency" ? `$${region.target.toLocaleString()}` : region.target}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end">
                                                        {kpi.unit === "currency" && <span className="mr-1 text-neutral-400">$</span>}
                                                        <Input
                                                            type="number"
                                                            className="w-24 text-right font-bold border-primary/20 focus-visible:ring-primary"
                                                            value={localActuals[`${selectedWeek}-${kpi.id}-${region.name}`] ?? getActualValue(kpi.id, region.name)}
                                                            onChange={(e) => handleActualChange(kpi.id, region.name, e.target.value)}
                                                            onBlur={(e) => handleBlur(kpi.id, region.name, e.target.value)}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className={`text-right font-semibold ${achieved >= 100 ? "text-emerald-600" : achieved >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                                                    {achieved.toFixed(0)}%
                                                </TableCell>
                                                <TableCell className={`text-right font-medium ${variance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                                    {kpi.unit === "currency"
                                                        ? (variance >= 0 ? `+$${variance.toLocaleString()}` : `-$${Math.abs(variance).toLocaleString()}`)
                                                        : (variance > 0 ? `+${variance.toFixed(2)}` : variance.toFixed(2))}
                                                </TableCell>
                                                <TableCell className="text-right bg-neutral-50 font-medium text-neutral-500">
                                                    {kpi.unit === "currency" ? `$${cumBudget.toLocaleString()}` : cumBudget.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right bg-neutral-50 font-bold text-neutral-900">
                                                    {kpi.unit === "currency" ? `$${cumActual.toLocaleString()}` : cumActual.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}

                                    {/* KPI Total Row */}
                                    <TableRow className="bg-primary/5 font-bold border-y-2 border-primary/10">
                                        <TableCell className="text-primary italic">Total {kpi.name}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell className="bg-primary/5"></TableCell>
                                        <TableCell className="text-right">
                                            {kpi.unit === "currency" ? `$${kpiTotalTarget.toLocaleString()}` : kpiTotalTarget}
                                        </TableCell>
                                        <TableCell className="text-right border-x-2 border-primary/10">
                                            {kpi.unit === "currency" ? `$${kpiTotalActual.toLocaleString()}` : kpiTotalActual}
                                        </TableCell>
                                        <TableCell className={`text-right ${kpiAchieved >= 100 ? "text-emerald-600" : "text-rose-600"}`}>
                                            {kpiAchieved.toFixed(0)}%
                                        </TableCell>
                                        <TableCell className={`text-right ${kpiVariance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                            {kpi.unit === "currency"
                                                ? (kpiVariance >= 0 ? `+$${kpiVariance.toLocaleString()}` : `-$${Math.abs(kpiVariance).toLocaleString()}`)
                                                : (kpiVariance > 0 ? `+${kpiVariance}` : kpiVariance)}
                                        </TableCell>
                                        <TableCell className="text-right bg-primary/5">
                                            {kpi.unit === "currency" ? `$${kpiTotalCumBudget.toLocaleString()}` : kpiTotalCumBudget.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right bg-primary/5">
                                            {kpi.unit === "currency" ? `$${kpiTotalCumActual.toLocaleString()}` : kpiTotalCumActual.toLocaleString()}
                                        </TableCell>
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

function Dashboard({
    week,
    allActuals,
    selectedKpiId,
    setSelectedKpiId
}: {
    week: number,
    allActuals: WeeklyActual[],
    selectedKpiId: string,
    setSelectedKpiId: (id: string) => void
}) {
    const selectedKpi = KPI_DATA.find(k => k.id === selectedKpiId) || KPI_DATA[0];

    // Aggregate data for charts filtered by KPI
    const weeklyPerformance = WEEKS.filter(w => w <= week).map(w => {
        const kpiTarget = selectedKpi.regions.reduce((s, r) => s + r.target, 0);
        const kpiActual = allActuals
            .filter(a => a.week === w && a.kpiId === selectedKpiId)
            .reduce((sum, a) => sum + a.actual, 0);
        return {
            name: `Week ${w}`,
            actual: kpiActual,
            target: kpiTarget
        };
    });

    const regionalPerformance = selectedKpi.regions.map(r => {
        const actual = allActuals.find(a => a.week === week && a.kpiId === selectedKpiId && a.regionName === r.name)?.actual || 0;
        return {
            name: r.name,
            actual: actual,
            target: r.target
        };
    });

    return (
        <div className="space-y-8">
            {/* KPI Selector */}
            <Card className="border-neutral-200 shadow-sm border">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-neutral-700">Filter by KPI:</span>
                        <Select value={selectedKpiId} onValueChange={setSelectedKpiId}>
                            <SelectTrigger className="w-[300px] bg-white border-neutral-200 focus:ring-primary">
                                <SelectValue placeholder="Select KPI" />
                            </SelectTrigger>
                            <SelectContent>
                                {KPI_DATA.map(kpi => (
                                    <SelectItem key={kpi.id} value={kpi.id}>{kpi.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Stats Overview */}
                <Card className="md:col-span-2 border-neutral-200 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="text-primary" />
                            {selectedKpi.name} - Performance Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyPerformance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => value.toLocaleString()} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number | string | undefined) => [value?.toLocaleString() || "0", "Value"]}
                                />
                                <Line type="monotone" dataKey="actual" stroke="#CC6328" strokeWidth={3} dot={{ r: 4, fill: '#CC6328' }} />
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
                                    formatter={(value: number | string | undefined) => [value?.toLocaleString() || "0", "Value"]}
                                />
                                <Bar dataKey="actual" fill="#CC6328" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-neutral-200 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="text-emerald-600" />
                            {selectedKpi.name} - Summary Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="text-sm font-medium text-primary">Total Progress (Week {week})</p>
                            <p className="text-2xl font-bold text-primary">
                                {selectedKpi.unit === "currency" ? "$" : ""}{weeklyPerformance[week - 1]?.actual.toLocaleString() || 0} / {selectedKpi.unit === "currency" ? "$" : ""}{weeklyPerformance[week - 1]?.target.toLocaleString() || 0}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                            <p className="text-sm font-medium text-purple-800">Best Region (Week {week})</p>
                            <p className="text-2xl font-bold text-purple-900">
                                {regionalPerformance.sort((a, b) => b.actual - a.actual)[0]?.name || "N/A"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
