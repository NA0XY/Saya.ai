import { Link } from "react-router";

export function SuccessMessage() {
  return (
    <div className="max-w-[800px] w-full animate-fade-in">
      <div className="bg-white rounded-2xl p-16 shadow-xl border border-gray-200 text-center">
        <div className="space-y-6">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-scale-in">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl font-bold tracking-tight">
              Prescription Verified and Activated
            </h2>
            <p className="text-lg text-gray-700">
              Medication reminders have been scheduled. Your companion will start calling at the specified times.
            </p>
          </div>

          <div className="flex flex-col gap-4 pt-6">
            <Link to="/dashboard">
              <button className="w-full bg-[#E85D2A] text-white px-10 py-4 rounded-xl shadow-lg hover:bg-[#d64d1f] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all font-semibold text-lg">
                Go to Dashboard
              </button>
            </Link>

            <Link to="/prescription-upload">
              <button className="w-full bg-white border-2 border-gray-300 px-10 py-4 rounded-xl hover:border-gray-400 hover:shadow-md transition-all font-semibold">
                Upload Another Prescription
              </button>
            </Link>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>All data is encrypted and secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
