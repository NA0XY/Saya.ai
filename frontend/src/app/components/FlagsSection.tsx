export function FlagsSection() {
  return (
    <section className="flags-section padding-section-medium">
      <div className="flag_video-wrapper">
        <div className="flagl-video w-embed" style={{
          background: 'linear-gradient(135deg, #f93f12 0%, #ff8c42 50%, #fbd474 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
        }}>
          <div style={{
            fontSize: '120px',
            opacity: 0.3,
            position: 'absolute',
          }}>🏳️</div>
        </div>
      </div>
      <div className="flags-text" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
        "Saya gave us peace of mind we never thought possible."
      </div>
    </section>
  );
}
