export function Footer() {
  return (
    <footer className="border-t border-cyan/20 bg-base-light/30 py-10 pb-20 lg:pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-px bg-cyan/30" />
          <p className="font-[family-name:var(--font-mono)] text-sm text-neon-green/70 tracking-wider">
            // END_OF_TRANSMISSION
          </p>
          <p className="font-[family-name:var(--font-mono)] text-xs text-steel-dim">
            &copy; {new Date().getFullYear()} tsilva &mdash; all_rights_reserved.dat
          </p>
        </div>
      </div>
    </footer>
  );
}
