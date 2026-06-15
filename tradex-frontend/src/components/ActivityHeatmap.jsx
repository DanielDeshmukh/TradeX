import React from "react";
import { subDays, format, startOfWeek, addDays, getDay, differenceInCalendarWeeks } from "date-fns";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "../heatmap.css";

const today = new Date();
const WEEKS = 52;

const dummyActivity = [
  { date: "2025-03-01", count: 1 },
  { date: "2025-03-02", count: 3 },
  { date: "2025-03-25", count: 69 },
  { date: "2025-03-05", count: 4 },
  { date: "2025-04-12", count: 2 },
  { date: "2025-06-28", count: 30 },
  { date: "2025-06-10", count: 5 },
  { date: "2025-07-01", count: 88 },
  { date: "2025-02-15", count: 5 },
  { date: "2025-06-21", count: 15 },
  { date: "2025-06-30", count: 25 },
  { date: "2025-07-18", count: 45 },
  { date: "2025-07-03", count: 10 },
  { date: "2025-10-04", count: 8 },
  { date: "2025-10-08", count: 8 },
  { date: "2025-09-26", count: 8 },
  { date: "2025-11-11", count: 12 },
];

const countMap = {};
dummyActivity.forEach((d) => {
  countMap[d.date] = d.count;
});

function getLevel(count) {
  if (!count) return 0;
  if (count >= 5) return 4;
  if (count >= 3) return 3;
  if (count >= 2) return 2;
  return 1;
}

const LEVEL_CLASSES = [
  "bg-surface-input",
  "bg-emerald-900",
  "bg-emerald-700",
  "bg-emerald-500",
  "bg-emerald-400",
];

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const ActivityHeatmap = () => {
  const weekStart = startOfWeek(subDays(today, WEEKS * 7), { weekStartsOn: 0 });
  const cells = [];

  for (let week = 0; week < WEEKS; week++) {
    for (let day = 0; day < 7; day++) {
      const date = addDays(weekStart, week * 7 + day);
      if (date > today) continue;
      const dateStr = format(date, "yyyy-MM-dd");
      const count = countMap[dateStr] || 0;
      const level = getLevel(count);
      cells.push({ date: dateStr, count, level, day });
    }
  }

  return (
    <div className="mt-6 p-4 bg-surface/70 backdrop-blur-md rounded-xl shadow-lg border border-white/5">
      <h2 className="text-lg font-semibold text-content mb-3">Daily Activity</h2>

      <div className="flex gap-1 overflow-x-auto pb-2">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-1 shrink-0">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="w-7 h-[11px] flex items-center text-[9px] text-content-muted">
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[3px]">
          {Array.from({ length: WEEKS }, (_, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }, (_, dayIdx) => {
                const cell = cells.find(
                  (c) =>
                    differenceInCalendarWeeks(
                      new Date(c.date),
                      weekStart,
                      { weekStartsOn: 0 }
                    ) === weekIdx && getDay(new Date(c.date)) === dayIdx
                );
                if (!cell) {
                  return (
                    <div
                      key={dayIdx}
                      className="w-[11px] h-[11px] rounded-[2px] bg-transparent"
                    />
                  );
                }
                return (
                  <div
                    key={dayIdx}
                    className={`w-[11px] h-[11px] rounded-[2px] cursor-pointer transition-colors hover:ring-1 hover:ring-white/20 ${LEVEL_CLASSES[cell.level]}`}
                    data-tooltip-id="heatmap-tooltip"
                    data-tooltip-content={`${format(new Date(cell.date), "MMM dd, yyyy")} — ${cell.count} trade${cell.count !== 1 ? "s" : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-[10px] text-content-muted">
        <span>Less</span>
        {LEVEL_CLASSES.map((cls, i) => (
          <div key={i} className={`w-[11px] h-[11px] rounded-[2px] ${cls}`} />
        ))}
        <span>More</span>
      </div>

      <ReactTooltip id="heatmap-tooltip" place="top" type="dark" effect="solid" />
    </div>
  );
};

export default ActivityHeatmap;
