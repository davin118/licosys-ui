export const chartPalette = {
  primary: "#2563eb",
  primarySoft: "#60a5fa",
  accent: "#0ea5e9",
  accentSoft: "#7dd3fc",
  teal: "#06b6d4",
  violet: "#4f46e5",
  slate: "#475569",
  grid: "rgba(71, 85, 105, 0.14)",
  axis: "#64748b",
  text: "#0f172a",
  tooltipBg: "#eff6ff",
  tooltipText: "#0f172a",
};

export const categoricalBluePalette = [
  "#2563eb",
  "#0ea5e9",
  "#06b6d4",
  "#4f46e5",
  "#38bdf8",
  "#60a5fa",
];

export const nivoTheme = {
  text: {
    fill: chartPalette.text,
    fontSize: 12,
  },
  axis: {
    domain: {
      line: {
        stroke: chartPalette.grid,
        strokeWidth: 1,
      },
    },
    ticks: {
      line: {
        stroke: chartPalette.grid,
        strokeWidth: 1,
      },
      text: {
        fill: chartPalette.axis,
        fontSize: 11,
      },
    },
    legend: {
      text: {
        fill: chartPalette.axis,
        fontSize: 12,
      },
    },
  },
  grid: {
    line: {
      stroke: chartPalette.grid,
      strokeWidth: 1,
    },
  },
  tooltip: {
    container: {
      background: chartPalette.tooltipBg,
      color: chartPalette.tooltipText,
      fontSize: 12,
      borderRadius: 12,
      boxShadow: "0 12px 30px rgba(37, 99, 235, 0.12)",
      padding: "10px 12px",
    },
  },
};
