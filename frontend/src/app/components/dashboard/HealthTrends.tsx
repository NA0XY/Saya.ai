import Plot from "react-plotly.js";

export function HealthTrends() {
  const heartRateData = {
    x: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    y: [72, 75, 70, 78, 74, 76, 73],
    type: "scatter",
    mode: "lines+markers",
    fill: "tozeroy",
    fillcolor: "rgba(232, 93, 42, 0.05)",
    line: { color: "#E85D2A", width: 4, shape: 'spline' },
    marker: { color: "#E85D2A", size: 8, bordercolor: 'white', borderwidth: 2 },
    name: "Heart Rate"
  };

  const activityData = {
    x: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    y: [3200, 4100, 2800, 5200, 4500, 3800, 3500],
    type: "bar",
    marker: { 
      color: "#83311A",
      opacity: 0.8,
      line: { color: "#83311A", width: 1 }
    },
    name: "Steps"
  };

  const commonLayout = {
    autosize: true,
    margin: { l: 40, r: 20, t: 10, b: 40 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { family: "'Barlow Condensed', sans-serif", color: "#83311A", size: 14 },
    xaxis: { 
      gridcolor: "rgba(131, 49, 26, 0.05)",
      zeroline: false,
      tickfont: { weight: 600 }
    },
    yaxis: { 
      gridcolor: "rgba(131, 49, 26, 0.05)",
      zeroline: false,
      tickfont: { weight: 600 }
    },
    showlegend: false,
    hovermode: "closest" as const
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="heading-display text-3xl">
          Health Vitals
        </h2>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-white border border-black/5 text-[#83311A] font-bold text-[10px] uppercase tracking-widest hover:bg-[#F5F1EA] transition-colors">
            7 Days
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-[#F5F1EA] border border-[#83311A]/10 text-[#83311A] font-bold text-[10px] uppercase tracking-widest">
            Full Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-black/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E85D2A] opacity-20 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-[#83311A] uppercase tracking-widest">Heart Rate (BPM)</h3>
            <div className="text-red-500 animate-pulse text-sm">❤️</div>
          </div>
          <Plot
            data={[heartRateData as any]}
            layout={{
              ...commonLayout,
              margin: { l: 30, r: 10, t: 10, b: 30 },
              yaxis: { ...commonLayout.yaxis, range: [60, 85] }
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: "100%", height: "200px" }}
          />
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-black/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#83311A] opacity-20 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-[#83311A] uppercase tracking-widest">Daily Steps</h3>
            <div className="text-[#83311A] text-sm">🏃</div>
          </div>
          <Plot
            data={[activityData as any]}
            layout={{
              ...commonLayout,
              margin: { l: 30, r: 10, t: 10, b: 30 },
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: "100%", height: "200px" }}
          />
        </div>
      </div>
    </div>
  );
}
