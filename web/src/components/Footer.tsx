export function Footer() {
  return (
    <footer className="border-t border-cyan/10 py-8 pb-16 lg:pb-8">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="font-[family-name:var(--font-mono)] text-xs text-steel-dim space-y-1">
        <p className="text-neon-green/60">// END_OF_TRANSMISSION</p>
        <p>
          &copy; {new Date().getFullYear()} tsilva &mdash; all_rights_reserved.dat
        </p>
      </div>
      </div>
    </footer>
  );
}
