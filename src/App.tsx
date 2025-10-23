
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Save, Upload, Download, RefreshCw, Calendar, FileText, BarChart as BarIcon } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const DOMAINS = [
  { key: "physical", label: "Physical Activity", def: "Frequency, intensity, strength, mobility; adherence" },
  { key: "nutrition", label: "Nutrition", def: "Quality, balance, portions, hydration; meal prep" },
  { key: "sleep", label: "Sleep", def: "Duration, continuity, regularity, hygiene" },
  { key: "stress", label: "Stress Load", def: "Perceived stress; stressor count/impact" },
  { key: "emotional", label: "Emotional/Mental", def: "Mood, resilience, outlook, joy" },
  { key: "social", label: "Social/Relationships", def: "Support, connectedness, boundaries" },
  { key: "purpose", label: "Purpose/Meaning", def: "Values alignment, direction, motivation" },
  { key: "environment", label: "Environment", def: "Home/work setup, clutter, light, nature" },
  { key: "medical", label: "Medical Self‑Care", def: "Preventive care, meds/supps adherence" },
  { key: "financial", label: "Financial Well‑being", def: "Budgeting, savings, aligned spending" },
] as const;

type Scores = Record<(typeof DOMAINS)[number]["key"], number>;

type Snapshot = {
  month: string;
  context?: string;
  scores: Scores;
  notes?: string;
};

const EMPTY_SCORES: Scores = Object.fromEntries(DOMAINS.map(d => [d.key, 0])) as Scores;
const STORAGE_KEY = "ihw_snapshots_v1";

function mean(nums: number[]) {
  const vals = nums.filter((n) => Number.isFinite(n));
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function IntegrativeHealthWheelApp() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Snapshot[]) : [];
    } catch {
      return [];
    }
  });

  const [activeMonth, setActiveMonth] = useState<string>(() => monthKey());

  useEffect(() => {
    setSnapshots((prev) => {
      const exists = prev.some((s) => s.month === activeMonth);
      if (exists) return prev;
      return [...prev, { month: activeMonth, scores: { ...EMPTY_SCORES }, context: "", notes: "" }];
    });
  }, [activeMonth]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  }, [snapshots]);

  const current = snapshots.find((s) => s.month === activeMonth) as Snapshot | undefined;
  const last = useMemo(() => {
    const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
    const idx = sorted.findIndex((s) => s.month === activeMonth);
    return idx > 0 ? sorted[idx - 1] : undefined;
  }, [snapshots, activeMonth]);

  function updateScore(key: keyof Scores, val: number) {
    if (!current) return;
    setSnapshots((prev) =>
      prev.map((s) => (s.month === current.month ? { ...s, scores: { ...s.scores, [key]: val } } : s))
    );
  }
  function updateField(field: keyof Snapshot, val: string) {
    if (!current) return;
    setSnapshots((prev) => prev.map((s) => (s.month === current.month ? { ...s, [field]: val } : s)));
  }

  const VBI = useMemo(() => mean([current?.scores.physical ?? 0, current?.scores.nutrition ?? 0, current?.scores.sleep ?? 0])), [current]);
  const ISI = useMemo(() => mean([current?.scores.stress ?? 0, current?.scores.emotional ?? 0, current?.scores.purpose ?? 0])), [current]);
  const SSI = useMemo(() => mean([current?.scores.social ?? 0, current?.scores.environment ?? 0, current?.scores.medical ?? 0, current?.scores.financial ?? 0])), [current]);
  const THS = useMemo(() => mean(Object.values(current?.scores ?? {})), [current]);

  const radarData = useMemo(() => DOMAINS.map((d) => ({ domain: d.label, score: current?.scores[d.key] ?? 0 })), [current]);

  function deltaFor(key: keyof Scores) {
    if (!last) return undefined;
    const cur = current?.scores[key] ?? 0;
    const prev = last.scores[key] ?? 0;
    return cur - prev;
  }

  function exportCSV() {
    const header = ["month", ...DOMAINS.map((d) => d.label), "VBI", "ISI", "SSI", "THS", "context", "notes"].join(",");
    const rows = snapshots
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((s) => {
        const vbi = mean([s.scores.physical, s.scores.nutrition, s.scores.sleep]);
        const isi = mean([s.scores.stress, s.scores.emotional, s.scores.purpose]);
        const ssi = mean([s.scores.social, s.scores.environment, s.scores.medical, s.scores.financial]);
        const ths = mean(Object.values(s.scores));
        const fields = [
          s.month,
          ...DOMAINS.map((d) => String(s.scores[d.key] ?? 0)),
          vbi.toFixed(2),
          isi.toFixed(2),
          ssi.toFixed(2),
          ths.toFixed(2),
          JSON.stringify(s.context ?? ""),
          JSON.stringify(s.notes ?? ""),
        ];
        return fields.join(",");
      });
    const csv = [header, ...rows].join("\\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "integrative_health_monthly.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleJSONImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Snapshot[];
        if (!Array.isArray(parsed)) throw new Error("Invalid JSON format");
        setSnapshots(parsed);
      } catch (err) {
        alert(`Import failed: ${err}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function addMonth(offset = 1) {
    const [y, m] = activeMonth.split("-").map(Number);
    const d = new Date(y, (m - 1) + offset, 1);
    setActiveMonth(monthKey(d));
  }
  function resetCurrent() {
    if (!current) return;
    if (!confirm("Reset this month's scores to 0?")) return;
    setSnapshots((prev) => prev.map((s) => (s.month === current.month ? { ...s, scores: { ...EMPTY_SCORES } } : s)));
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Integrative Health Wheel</h1>
            <p className="text-sm text-neutral-400">Monthly self‑assessment • Scores, deltas, radar wheel, and exports.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => window.print()} title="Print report"><FileText className="mr-2 h-4 w-4"/>Print</Button>
            <Button variant="secondary" onClick={exportCSV} title="Export CSV"><Download className="mr-2 h-4 w-4"/>CSV</Button>
            <div>
              <input id="jsonFile" type="file" accept="application/json" className="hidden" onChange={handleJSONImport} />
              <Label htmlFor="jsonFile" className="cursor-pointer inline-flex items-center px-3 py-2 rounded-md border border-neutral-700 hover:bg-neutral-800 text-sm">
                <Upload className="mr-2 h-4 w-4"/>Import JSON
              </Label>
            </div>
          </div>
        </header>

        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:grid-cols-3 items-end">
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-neutral-300">Month</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <Button variant="secondary" onClick={() => addMonth(-1)} title="Previous"><Calendar className="h-4 w-4"/></Button>
                    <Input value={activeMonth} onChange={(e) => setActiveMonth(e.target.value)} placeholder="YYYY-MM" />
                    <Button variant="secondary" onClick={() => setActiveMonth(monthKey())} title="Jump to current">Today</Button>
                    <Button variant="secondary" onClick={() => addMonth(+1)} title="Next">→</Button>
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-2">
                  <Label className="text-neutral-300">Context (workload/life events)</Label>
                  <Input value={current?.context ?? ""} onChange={(e) => updateField("context", e.target.value)} placeholder="Exams, travel, illness, job change…" />
                </div>
              </div>
              <div className="flex gap-2 sm:ml-auto">
                <Button variant="outline" onClick={resetCurrent}><RefreshCw className="mr-2 h-4 w-4"/>Reset Scores</Button>
                <Button variant="destructive" onClick={() => setSnapshots([])}><Save className="mr-2 h-4 w-4"/>Clear All</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-1">
                <BarIcon className="h-5 w-5"/>
                <h2 className="text-lg font-semibold">Scores (0–10)</h2>
              </div>
              <div className="space-y-4">
                {DOMAINS.map((d) => {
                  const val = current?.scores[d.key] ?? 0;
                  const delta = deltaFor(d.key);
                  return (
                    <div key={d.key} className="rounded-2xl p-3 bg-neutral-950/60 border border-neutral-800">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <div className="font-medium">{d.label}</div>
                          <div className="text-xs text-neutral-400">{d.def}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl tabular-nums leading-none">{val}</div>
                          <div className={`text-xs ${typeof delta === "number" ? (delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-neutral-400") : "text-neutral-500"}`}>
                            {typeof delta === "number" ? (delta > 0 ? `▲ +${delta.toFixed(1)}` : delta < 0 ? `▼ ${delta.toFixed(1)}` : "— 0.0") : "—"}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <Slider value={[val]} min={0} max={10} step={1} onValueChange={([v]) => updateScore(d.key, v)} className="flex-1" />
                        <Input type="number" min={0} max={10} step={1} value={val} onChange={(e) => updateScore(d.key, Math.max(0, Math.min(10, Number(e.target.value))))} className="w-20" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold mb-4">Wheel of Health (Radar)</h2>
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius={140}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="domain" tick={{ fill: "#d4d4d8", fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => `${v}/10`} contentStyle={{ background: "#0a0a0a", border: "1px solid #27272a", color: "#e4e4e7" }} />
                    <Radar name="Score" dataKey="score" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Metric label="VBI" hint="Physical, Nutrition, Sleep" value={VBI} />
                <Metric label="ISI" hint="Stress, Emotional, Purpose" value={ISI} />
                <Metric label="SSI" hint="Social, Environment, Medical, Financial" value={SSI} />
                <Metric label="Total" hint="Mean of all 10 domains" value={THS} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold">Reflection</h2>
            <textarea
              value={current?.notes ?? ""}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Wins, bottlenecks, micro‑skills for next month…"
              className="w-full min-h-[120px] rounded-xl bg-neutral-950 border border-neutral-800 p-3 focus:outline-none focus:ring-1 focus:ring-neutral-700"
            />
          </CardContent>
        </Card>

        <footer className="text-center text-xs text-neutral-500 py-4 print:hidden">
          Built with ❤️ • Data stays in your browser (LocalStorage) • Export/Import anytime
        </footer>
      </div>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-2xl p-3 bg-neutral-950/60 border border-neutral-800">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-sm text-neutral-400">{label}</div>
          <div className="text-[11px] text-neutral-500">{hint}</div>
        </div>
        <div className="text-2xl font-semibold tabular-nums">{value.toFixed(2)}</div>
      </div>
    </div>
  );
}
