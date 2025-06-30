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
  { date: "2024-07-01", count: 88 },
  { date: "2025-02-15", count: 5 },
  { date: "2025-06-29", count: 15 },
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
    <div className="mt-6 text-white p-4">
      <h2 className="text-lg font-semibold mb-3">Daily Activity</h2>
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
      <ReactTooltip id="heatmap-tooltip" place="top" type="dark" effect="solid" />
    </div>
  );
};

export default ActivityHeatmap;
