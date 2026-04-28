export function SafetyStatus() {
  const statuses = [
    {
      title: "Medication Schedule",
      status: "Active",
      statusColor: "text-green-600",
      icon: "💊",
      bgColor: "bg-white",
      description: "Next dose at 2:00 PM"
    },
    {
      title: "Food Interactions",
      status: "Warnings Detected",
      statusColor: "text-[#E85D2A]",
      icon: "⚠️",
      bgColor: "bg-white",
      description: "Check interaction with lunch"
    },
    {
      title: "Emotional State",
      status: "Stable",
      statusColor: "text-blue-600",
      icon: "❤️",
      bgColor: "bg-white",
      description: "Last signal 5m ago"
    },
    {
      title: "Call Compliance",
      status: "Last: 10:00 AM",
      statusColor: "text-gray-700",
      icon: "📞",
      bgColor: "bg-white",
      description: "Successful confirmation"
    }
  ];

  return (
    <section className="safety-status-section">
      <div className="flex flex-col gap-6">
        <div className="section-header flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#83311A]">Safety Status</h2>
          </div>
          <div className="px-4 py-2 bg-[#E85D2A]/10 rounded-full border border-[#E85D2A]/20 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#E85D2A] rounded-full animate-pulse"></div>
            <span className="text-sm font-bold uppercase tracking-widest text-[#E85D2A]">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {statuses.map((item, index) => (
            <div
              key={index}
              className={`${item.bgColor} rounded-2xl p-6 shadow-sm border border-black/5 hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#E85D2A] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#F5F1EA] to-[#E85D2A]/5 rounded-2xl flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">{item.title}</h3>
                  <p className={`text-lg font-bold ${item.statusColor}`}>
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
