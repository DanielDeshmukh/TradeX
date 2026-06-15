import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subDays, format } from "date-fns";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import "../heatmap.css";

const today = new Date();

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
  { date: "2025-10-04", count: 8 },
  { date: "2025-11-11", count: 12 },
];

const heatmapClassForValue = (value) => {
  if (!value) return "color-empty";
  if (value.count >= 5) return "color-scale-4";
  if (value.count >= 3) return "color-scale-3";
  if (value.count >= 2) return "color-scale-2";
  return "color-scale-1";
};

const ActivityHeatmap = () => {
  return (
    <div className="mt-6 text-white p-4 bg-bg-secondary/70 backdrop-blur-md rounded-xl shadow-lg">
      <h2 className="text-lg font-semibold mb-3">Daily Activity</h2>
      
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#7F3DFF] scrollbar-track-[#1F2937] rounded-lg">
        <div className="min-w-[700px]">
          <CalendarHeatmap
            startDate={subDays(today, 365)}
            endDate={today}
            values={dummyActivity}
            classForValue={heatmapClassForValue}
            showWeekdayLabels={false}
            gutterSize={2}
            tooltipDataAttrs={value =>
              value?.date
                ? {
                  "data-tooltip-id": "heatmap-tooltip",
                  "data-tooltip-content": `${format(
                    new Date(value.date),
                    "MMM dd, yyyy"
                  )} - ${value.count} trade${value.count > 1 ? "s" : ""}`,
                }
                : {}
            }
          />
        </div>
      </div>

      <ReactTooltip id="heatmap-tooltip" place="top" type="dark" effect="solid" />
    </div>
  );
};

export default ActivityHeatmap;
