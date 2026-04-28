export function UpcomingCalls() {
  const calls = [
    {
      medicine: "Metoprolol 50mg",
      time: "08:00 AM",
      status: "completed",
      statusText: "Completed"
    },
    {
      medicine: "Aspirin 75mg",
      time: "02:00 PM",
      status: "scheduled",
      statusText: "Scheduled"
    },
    {
      medicine: "Vitamin D3",
      time: "08:00 PM",
      status: "scheduled",
      statusText: "Scheduled"
    },
    {
      medicine: "Blood Pressure Check",
      time: "Yesterday 08:00 AM",
      status: "missed",
      statusText: "Missed"
    }
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "scheduled":
        return "bg-[#F5F1EA] text-[#83311A] border-[#83311A]/20";
      case "missed":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <h2 className="text-3xl font-bold text-[#83311A]">
        Call History
      </h2>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 relative overflow-hidden group h-full">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#E85D2A] opacity-20 group-hover:opacity-100 transition-opacity"></div>
        <div className="space-y-2">
          {calls.map((call, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-4 px-4 border-b border-[#83311A]/5 last:border-b-0 hover:bg-[#F5F1EA]/40 rounded-lg transition-all group/item"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#F5F1EA] to-[#E85D2A]/5 flex items-center justify-center text-lg group-hover/item:scale-110 transition-transform flex-shrink-0">
                  {call.medicine.includes('Blood Pressure') ? '❤️' : '💊'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#83311A] text-sm">{call.medicine}</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">{call.time}</p>
                </div>

                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border flex-shrink-0 ${getStatusStyle(call.status)}`}>
                  {call.statusText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
