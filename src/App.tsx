import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Button,
} from "@/components/ui/button";
import {
  Input,
} from "@/components/ui/input";
import {
  Label,
} from "@/components/ui/label";
import {
  RefreshCw,
  Save,
  Calendar,
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

interface WheelSnapshot {
  month: string;
  scores: Record<string, number>;
  context: string;
}

const AREAS = [
  "Physical",
  "Emotional",
  "Intellectual",
  "Spiritual",
  "Social",
  "Occupational",
  "Environmental",
  "Financial",
];

export default function App() {
  const [snapshots, setSnapshots] = useState<WheelSnapshot[]>([]);
  const [activeMonth, setActiveMonth] = useState<string>(monthKey());
  const [current, setCurrent] = useState<WheelSnapshot>({
    month: monthKey(),
    scores: Object.fromEntries(AREAS.map((a) => [a, 5])),
    context: "",
  });

  const updateField = (key: keyof WheelSnapshot, value: any) =>
    setCurrent((prev) => ({ ...prev, [key]: value }));

  const updateScore = (area: string, value: number) =>
    setCurrent((prev) => ({
      ...prev,
      scores: { ...prev.scores, [area]: value },
    }));

  const resetCurrent = () =>
    setCurrent({
      ...current,
      scores: Object.fromEntries(AREAS.map((a) => [a, 5])),
    });

  const addMonth = (delta: number) => {
    const date = new Date(activeMonth + "-01");
    date.setMonth(date.getMonth() + delta);
    setActiveMonth(date.toISOString().slice(0, 7));
  };

  const currentData = useMemo(
    () =>
      AREAS.map((area) => ({
        area,
        score: current.scores[area],
      })),
    [current]
  );

  const saveSnapshot = () => {
    setSnapshots((prev) => [
      ...prev.filter((s) => s.month !== activeMonth),
      { ...current, month: activeMonth },
    ]);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold text-center mb-4">
          Integrative Health Wheel
        </h1>

        {/* Month, Context, and Actions */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 lg:gap-6">
              {/* Month */}
              <div className="md:col-span-5">
                <Label className="block text-neutral-300 mb-2">Month</Label>

                <div className="flex items-center gap-2 mb-2">
                  <Input
                    value={activeMonth}
                    onChange={(e) => setActiveMonth(e.target.value)}
                    placeholder="YYYY-MM"
                    className="w-full md:w-auto md:flex-1 md:max-w-[220px] lg:max-w-[260px] xl:max-w-[300px]"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => setActiveMonth(monthKey())}
                    title="Jump to current month"
                    className="shrink-0 whitespace-nowrap md:hidden"
                  >
                    Today
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => addMonth(-1)}
                    title="Previous Month"
                    className="shrink-0 whitespace-nowrap md:px-3 md:py-2"
                  >
                    Prev
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setActiveMonth(monthKey())}
                    title="Jump to current"
                    className="shrink-0 whitespace-nowrap hidden md:inline-flex md:px-3 md:py-2"
                  >
                    Today
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => addMonth(+1)}
                    title="Next Month"
                    className="shrink-0 whitespace-nowrap md:px-3 md:py-2"
                  >
                    Next
                  </Button>
                </div>
              </div>

              {/* Context */}
              <div className="md:col-span-7">
                <Label className="block text-neutral-300 mb-2">
                  Context (workload/life events)
                </Label>
                <Input
                  value={current?.context ?? ""}
                  onChange={(e) => updateField("context", e.target.value)}
                  placeholder="Exams, travel, illness, job change…"
                  className="w-full md:max-w-[520px] lg:max-w-[620px] xl:max-w-[720px]"
                />
              </div>

              {/* Actions */}
              <div className="md:col-span-12 flex flex-wrap gap-2 justify-start md:justify-end">
                <Button
                  variant="outline"
                  onClick={resetCurrent}
                  className="shrink-0 whitespace-nowrap md:px-3 md:py-2"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Scores
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setSnapshots([])}
                  className="shrink-0 whitespace-nowrap md:px-3 md:py-2"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <div className="w-full h-[400px] md:h-[500px]">
              <ResponsiveContainer>
                <RadarChart data={currentData}>
                  <PolarGrid stroke="#3b3b3b" />
                  <PolarAngleAxis
                    dataKey="area"
                    tick={{ fill: "#ccc", fontSize: 12 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#555" />
                  <Radar
                    name="Current"
                    dataKey="score"
                    stroke="#4fd1c5"
                    fill="#4fd1c5"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Scores input grid */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {AREAS.map((area) => (
                <div key={area} className="flex flex-col">
                  <Label className="mb-1 text-neutral-300">{area}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={current.scores[area]}
                    onChange={(e) =>
                      updateScore(area, Number(e.target.value) || 0)
                    }
                    className="text-center"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save & Export */}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            onClick={saveSnapshot}
            variant="default"
            className="shrink-0 whitespace-nowrap"
          >
            <Save className="mr-2 h-4 w-4" /> Save Month
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              const blob = new Blob([JSON.stringify(snapshots, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "health-wheel-data.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export JSON
          </Button>
        </div>
      </div>
    </main>
  );
}

/* --- Helpers --- */
function monthKey() {
  const d = new Date();
  return d.toISOString().slice(0, 7);
}
