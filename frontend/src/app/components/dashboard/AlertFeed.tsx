export function AlertFeed() {
  const alerts = [
    {
      message: "Medicine not confirmed",
      timestamp: "2 hours ago",
      severity: "high",
      icon: "💊"
    },
    {
      message: "Low mood detected in conversation",
      timestamp: "5 hours ago",
      severity: "medium",
      icon: "😔"
    },
    {
      message: "Call not answered at scheduled time",
      timestamp: "Yesterday, 8:00 PM",
      severity: "medium",
      icon: "📞"
    },
    {
      message: "Blood pressure reading normal",
      timestamp: "Yesterday, 2:00 PM",
      severity: "low",
      icon: "❤️"
    },
    {
      message: "Daily check-in completed",
      timestamp: "2 days ago",
      severity: "low",
      icon: "✅"
    }
  ];

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]";
      case "medium":
        return "bg-[#E85D2A] shadow-[0_0_12px_rgba(232,93,42,0.4)]";
      case "low":
        return "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-[#83311A]">
          Recent Alerts
        </h2>
        <button className="text-sm font-bold uppercase tracking-widest text-[#E85D2A] hover:underline px-4 py-2.5 bg-[#E85D2A]/5 rounded-lg border border-[#E85D2A]/10 self-start sm:self-auto transition-all hover:bg-[#E85D2A]/10">
          View All Alerts
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#E85D2A] opacity-20 group-hover:opacity-100 transition-opacity"></div>
        <div className="space-y-2">
          {alerts.slice(0, 4).map((alert, index) => (
            <div
              key={index}
              className="flex items-start gap-4 py-4 px-4 border-b border-[#83311A]/5 last:border-b-0 hover:bg-[#F5F1EA]/40 rounded-lg transition-all group/item"
            >
              <div className="relative mt-1.5 flex-shrink-0">
                <div className={`w-2 h-2 rounded-full ${getSeverityStyle(alert.severity)} flex-shrink-0 relative z-10`} />
                {alert.severity === 'high' && (
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                )}
              </div>

              <div className="w-10 h-10 rounded-lg bg-[#F5F1EA] flex items-center justify-center text-lg group-hover/item:scale-110 transition-transform flex-shrink-0">
                {alert.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#83311A] text-sm leading-tight">{alert.message}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">{alert.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
