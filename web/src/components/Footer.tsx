export function Footer() {
  return (
    <footer className="border-t border-cyan/20 bg-base-light/30 py-12 pb-24 lg:pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center gap-4">
          {/* Decorative element */}
          <div className="flex items-center gap-2">
            <span className="text-cyan/40 text-xs">&#x250C;&#x2500;&#x2500;&#x2500;</span>
            <div className="w-12 h-px bg-cyan/30" />
            <span className="text-kiroshi-red text-xs">&#x25C6;</span>
            <div className="w-12 h-px bg-cyan/30" />
            <span className="text-cyan/40 text-xs">&#x2500;&#x2500;&#x2500;&#x2510;</span>
          </div>
          
          <p className="font-[family-name:var(--font-mono)] text-sm text-neon-green/70 tracking-wider">
            // END_OF_TRANSMISSION
          </p>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-kiroshi-red/50 animate-pulse" />
            <p className="font-[family-name:var(--font-mono)] text-xs text-steel-dim">
              &copy; {new Date().getFullYear()} tsilva &mdash; all_rights_reserved.dat
            </p>
            <span className="w-2 h-2 rounded-full bg-kiroshi-red/50 animate-pulse" />
          </div>
          
          <div className="text-cyan/20 font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] mt-2">
            KIROSHI_OPTICS_DISCONNECT
          </div>
        </div>
      </div>
    </footer>
  );
}
