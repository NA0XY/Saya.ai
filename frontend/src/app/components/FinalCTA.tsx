import { Link } from "react-router";

export function FinalCTA() {
  return (
    <section className="w-full bg-[#F5F1EA]" style={{ padding: "120px 0 140px" }}>
      <div className="max-w-[1200px] mx-auto px-20 flex flex-col items-center">
        <h2 className="heading-display text-center" style={{ fontSize: "clamp(36px, 4vw, 60px)" }}>
          <span className="block text-[#1A1A1A]">GIVE YOUR PARENTS</span>
          <span className="block text-[#E85D2A]">REAL CARE —</span>
          <span className="block text-[#1A1A1A]">EVEN FROM FAR AWAY</span>
        </h2>

        <Link to="/auth" className="inline-block mt-12">
          <button
            className="bg-[#E9C46A] px-14 py-5 rounded-[11px] border border-[#d4b25f] hover:bg-[#dbb860] transition-all hover:scale-105 uppercase text-lg font-semibold cursor-pointer"
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              letterSpacing: "0.08em",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            GET STARTED
          </button>
        </Link>
      </div>
    </section>
  );
}
