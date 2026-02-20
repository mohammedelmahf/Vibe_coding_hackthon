'use client';

export default function DeliveryBanner() {
  return (
    <div className="mx-4 mt-3">
      <div
        className="rounded-2xl p-4 flex items-center gap-3.5 active:scale-[0.98] transition-transform relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f1923 0%, #1a3050 50%, #0f1923 100%)',
          willChange: 'transform',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.05) inset',
        }}
      >
        {/* Decorative glow */}
        <div
          className="absolute -right-8 -top-8 w-[140px] h-[140px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,122,255,0.15) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -left-4 -bottom-4 w-[100px] h-[100px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(90,200,250,0.08) 0%, transparent 70%)' }}
        />

        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #007aff, #5ac8fa)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h5l2-7h6l2 7h5" />
            <circle cx="5" cy="17" r="2" />
            <circle cx="19" cy="17" r="2" />
            <path d="M7 17h10" />
            <path d="M2 12v5h3M22 12v5h-3" />
          </svg>
        </div>
        <div className="flex-1 min-w-0 relative">
          <p className="text-white text-[15px] font-semibold leading-tight tracking-tight">
            Deliver to your berth
          </p>
          <p className="text-white/45 text-[13px] mt-0.5 leading-snug">
            Same-day to 12+ marinas
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0 relative">
          <span className="text-[13px] font-bold text-white/90">
            €9.95
          </span>
          <span className="text-[10px] text-white/40 uppercase tracking-wider">
            from
          </span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" opacity="0.3" className="flex-shrink-0">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  );
}
