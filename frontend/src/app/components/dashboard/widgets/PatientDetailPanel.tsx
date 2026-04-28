import React from "react";
import { ExternalLink, PlayCircle, Pill, Sparkles, Phone, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { SketchCard } from "./SketchCard";

const SG = "'Space Grotesk', sans-serif";
const IN = "'Inter', sans-serif";

export function PatientDetailPanel({ onTestContext }: { onTestContext: () => void }) {
  return (
    <SketchCard seed={7} className="flex flex-col h-full" style={{ padding: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
        <h2 style={{ fontFamily: SG, fontWeight: 700, fontSize: "14px", color: "#1A1A1A", letterSpacing: "-0.01em" }}>
          Visit details
        </h2>
        <button
          onClick={onTestContext}
          className="flex items-center gap-1.5 border border-[#2D2F6E]/20 text-[#2D2F6E] px-3 py-1.5 rounded-lg hover:bg-[#2D2F6E] hover:text-white transition-all"
          style={{ fontFamily: IN, fontSize: "10px", fontWeight: 500 }}
        >
          <PlayCircle size={11} />
          Test context
        </button>
      </div>

      {/* Body — scrollable */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}
      >
        {/* Patient identity */}
        <div className="flex items-start justify-between">
          <div>
            <h3 style={{ fontFamily: SG, fontWeight: 600, fontSize: "15px", color: "#FF4D1C", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Taigo Wilkinson
            </h3>
            <p style={{ fontFamily: IN, fontWeight: 300, fontSize: "10px", color: "rgba(26,26,26,0.45)", marginTop: "3px" }}>
              Male · 38 years, 5 months
            </p>
          </div>
          <div
            className="bg-[#2D2F6E]/5 border border-[#2D2F6E]/10 px-2.5 py-1.5 rounded-lg"
            style={{ fontFamily: IN, fontWeight: 600, fontSize: "10px", color: "#2D2F6E", letterSpacing: "0.04em" }}
          >
            1EG4-TE5-MK72
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <p style={{ fontFamily: IN, fontWeight: 600, fontSize: "9px", color: "rgba(26,26,26,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            Symptoms
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Fever",             style: "bg-blue-50 border-blue-100 text-blue-700"     },
              { label: "Cough",             style: "bg-blue-50 border-blue-100 text-blue-700"     },
              { label: "Heart Burn",        style: "bg-amber-50 border-amber-100 text-amber-700"  },
              { label: "Liver Sensitivity ⚠", style: "bg-purple-50 border-purple-100 text-purple-700" },
            ].map(({ label, style }) => (
              <span
                key={label}
                className={`px-2.5 py-1 rounded-lg border ${style}`}
                style={{ fontFamily: IN, fontWeight: 500, fontSize: "11px" }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* AI Suggestion */}
        <div className="bg-gradient-to-r from-[#2D2F6E]/5 to-[#FF4D1C]/5 border border-[#2D2F6E]/10 rounded-xl px-3.5 py-2.5 flex items-start gap-2.5">
          <Sparkles size={12} className="text-[#FF4D1C] flex-shrink-0 mt-0.5" />
          <div>
            <p style={{ fontFamily: SG, fontWeight: 500, fontSize: "11px", color: "rgba(26,26,26,0.75)" }}>AI suggestion</p>
            <p style={{ fontFamily: IN, fontWeight: 400, fontSize: "10px", color: "rgba(26,26,26,0.5)", marginTop: "3px", lineHeight: 1.6 }}>
              Possible GERD based on heartburn and liver sensitivity. Consider PPI therapy before confirming.
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-3">
          <div>
            <p style={{ fontFamily: IN, fontWeight: 600, fontSize: "9px", color: "rgba(26,26,26,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
              Last checked
            </p>
            <p style={{ fontFamily: IN, fontWeight: 400, fontSize: "12px", color: "rgba(26,26,26,0.7)", lineHeight: 1.6 }}>
              Dr Everly · 21 April 2026 &nbsp;—&nbsp;
              <span style={{ color: "#2D2F6E", fontWeight: 500 }}>Rx #2J9B3KTO</span>
            </p>
          </div>
          <div>
            <p style={{ fontFamily: IN, fontWeight: 600, fontSize: "9px", color: "rgba(26,26,26,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
              Observation
            </p>
            <p style={{ fontFamily: IN, fontWeight: 400, fontSize: "12px", color: "rgba(26,26,26,0.65)", lineHeight: 1.6 }}>
              High fever and persistent cough at normal hemoglobin levels.
            </p>
            <span
              className="inline-flex items-center gap-1 mt-1.5 bg-orange-50 border border-orange-100 text-orange-700 px-2 py-0.5 rounded-md"
              style={{ fontFamily: IN, fontWeight: 500, fontSize: "10px" }}
            >
              Companion detected: Anxious
            </span>
          </div>
        </div>

        {/* Prescription */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5" style={{ fontFamily: IN, fontWeight: 600, fontSize: "10px", color: "#FF4D1C" }}>
              <Pill size={11} />
              Pending verification
            </div>
            <Link
              to="/dashboard/settings"
              className="flex items-center gap-1 hover:text-[#FF4D1C] transition-colors"
              style={{ fontFamily: IN, fontWeight: 500, fontSize: "10px", color: "#2D2F6E" }}
            >
              Edit <ExternalLink size={9} />
            </Link>
          </div>
          <ul className="flex flex-col gap-1.5">
            {[
              ["Paracetamol", "2× daily"],
              ["Diazepam",    "Day/Night, before meal"],
            ].map(([drug, dose]) => (
              <li key={drug} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-[#2D2F6E] mt-1.5 flex-shrink-0" />
                <span style={{ fontFamily: IN, fontWeight: 400, fontSize: "12px", color: "rgba(26,26,26,0.7)", lineHeight: 1.5 }}>
                  <strong style={{ fontWeight: 600, color: "#1A1A1A" }}>{drug}</strong> — {dose}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 px-5 py-3.5 border-t border-gray-100 flex gap-2">
        <button
          className="flex-1 flex items-center justify-center gap-2 bg-[#FF4D1C] hover:bg-[#e03a0b] text-white rounded-xl py-2.5 transition-colors"
          style={{ fontFamily: SG, fontWeight: 500, fontSize: "12px" }}
        >
          <ClipboardList size={13} />
          Generate prescription
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 bg-[#2D2F6E] hover:bg-[#1e2054] text-white rounded-xl py-2.5 transition-colors"
          style={{ fontFamily: SG, fontWeight: 500, fontSize: "12px" }}
        >
          <Phone size={13} />
          Start consultation
        </button>
      </div>
    </SketchCard>
  );
}
