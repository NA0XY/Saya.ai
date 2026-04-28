import type { SafetyStatusDto } from "../../lib/api";

type SafetyStatusProps = {
  statuses?: SafetyStatusDto[];
  isLoading?: boolean;
  error?: string | null;
};

const fallbackStatuses: SafetyStatusDto[] = [
    {
      title: "Medication Schedule",
      status: "Active",
      statusColor: "green",
      icon: "💊",
      description: "Next dose at 2:00 PM"
    },
    {
      title: "Food Interactions",
      status: "Warnings Detected",
      statusColor: "orange",
      icon: "⚠️",
      description: "Check interaction with lunch"
    },
    {
      title: "Emotional State",
      status: "Stable",
      statusColor: "blue",
      icon: "❤️",
      description: "Last signal 5m ago"
    },
    {
      title: "Call Compliance",
      status: "Last: 10:00 AM",
      statusColor: "green",
      icon: "📞",
      description: "Successful confirmation"
    }
  ];

const colorClass = {
  green: "text-green-600",
  orange: "text-[#E85D2A]",
  red: "text-red-600",
  blue: "text-blue-600"
};

export function SafetyStatus({ statuses, isLoading = false, error = null }: SafetyStatusProps) {
  const visibleStatuses = statuses?.length ? statuses : fallbackStatuses;

  return (
    <section className="safety-status-section">
      <div className="flex flex-col gap-6">
        <div className="section-header flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#83311A]">Safety Status</h2>
          </div>
          <div className="px-4 py-2 bg-[#E85D2A]/10 rounded-full border border-[#E85D2A]/20 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#E85D2A] rounded-full animate-pulse"></div>
            <span className="text-sm font-bold uppercase tracking-widest text-[#E85D2A]">
              {error ? "Demo" : isLoading ? "Syncing" : "Live"}
            </span>
          </div>
        </div>
        {error && (
          <p className="text-sm font-semibold text-[#E85D2A] bg-[#E85D2A]/10 border border-[#E85D2A]/20 rounded-xl px-4 py-3">
            Backend safety status unavailable: {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {visibleStatuses.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#E85D2A] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#F5F1EA] to-[#E85D2A]/5 rounded-2xl flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">{item.title}</h3>
                  <p className={`text-lg font-bold ${colorClass[item.statusColor]}`}>
                    {item.status}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium mt-4 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
